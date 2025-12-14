require 'pry'

require 'sinatra'
require 'liquid'
require 'redcarpet'
require 'dotenv/load'
require 'notion-ruby-client'
require 'notion_to_html'
require 'uri'
require 'yaml'
require 'digest'
require 'json'
require 'fileutils'
require_relative 'filesystem_cache'
# require 'kramdown'

def markdown_to_html(markdown)
  preprocessed_markdown = markdown.gsub(/(?<!^\n)^```/, "\n```")
  Redcarpet::Markdown.new(
    Redcarpet::Render::Safe.new,
    autolink: true,
    tables: true,
    fenced_code_blocks: true,
    highlight: true
  ).render(preprocessed_markdown)
end

def fetch_page(page_path)
  page_file_path = File.expand_path(File.join('content', "#{page_path}.md"))
  page_file_text = File.read(page_file_path)
  page_file_header_yaml = page_file_text.match(/^---\n*[\s\S]*?\n---\n/)[0]
  page_file_header_hash = YAML.safe_load(page_file_header_yaml).to_h
  page_markdown = page_file_text.gsub(/^---\n*[\s\S]*?\n---\n/, '')
  page_html = markdown_to_html(page_markdown)
  page_date = Time.parse(page_file_header_hash['date'])
  page = page_file_header_hash.merge({
    "html" => page_html,
    "path" => page_path,
    "date" => page_file_header_hash['date']
  })
  return page
end

def fetch_subpages(path)
  subpage_file_paths = Dir.glob(File.join('content', path, '*.md'))
  subpages = []
  subpage_file_paths.each do |subpage_file_path|
    subpage_file_slug = File.basename(subpage_file_path, '.md')
    subpage = fetch_page(File.join(path, subpage_file_slug))
    subpages << subpage
  end
  return subpages
end

# File-based cache for chirps and posts from Notion
$cache = FilesystemCache.new

def read_page_content_cache(page_id, last_edited_time)
  cache_dir = $cache.cache_dir
  safe_key = "page_content_#{page_id}".gsub(/[^a-zA-Z0-9_-]/, '_')
  cache_file = File.join(cache_dir, "#{Digest::MD5.hexdigest(safe_key)}.json")
  return nil unless File.exist?(cache_file)
  
  begin
    cache_data = JSON.parse(File.read(cache_file))
    cached_time = Time.parse(cache_data['last_edited_time'])
    current_time = Time.parse(last_edited_time)
    
    # Use cached content if page hasn't been updated
    if current_time <= cached_time
      return cache_data['content']
    else
      # Page was updated, delete old cache
      File.delete(cache_file) if File.exist?(cache_file)
      return nil
    end
  rescue => e
    File.delete(cache_file) if File.exist?(cache_file)
    return nil
  end
end

def write_page_content_cache(page_id, content, last_edited_time)
  cache_dir = $cache.cache_dir
  safe_key = "page_content_#{page_id}".gsub(/[^a-zA-Z0-9_-]/, '_')
  cache_file = File.join(cache_dir, "#{Digest::MD5.hexdigest(safe_key)}.json")
  cache_data = {
    'content' => content,
    'last_edited_time' => last_edited_time || Time.now.iso8601
  }
  File.write(cache_file, JSON.generate(cache_data))
end

def notion_client
  @notion_client ||= Notion::Client.new(token: ENV['NOTION_TOKEN'])
end

def extract_page_id_from_notion_url(url)
  # Extract page ID from Notion URL
  # Format: https://www.notion.so/blog_content-0f1b55769779411a95df1ee9b4b070c9
  # or: https://notion.so/blog_content-0f1b55769779411a95df1ee9b4b070c9
  # or already formatted: https://www.notion.so/blog_content-0f1b5576-9779-411a-95df-1ee9b4b070c9
  
  # Try to match UUID format first (with dashes)
  uuid_match = url.match(/-([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i)
  if uuid_match
    return uuid_match[1]
  end
  
  # Try to match 32-character hex string (without dashes)
  hex_match = url.match(/-([a-f0-9]{32})$/i)
  if hex_match
    # Format as UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    id = hex_match[1]
    return "#{id[0..7]}-#{id[8..11]}-#{id[12..15]}-#{id[16..19]}-#{id[20..31]}"
  end
  
  raise "Could not extract page ID from CONTENT_NOTION_URL: #{url}"
end

def find_database_id(content_page_id, database_name)
  # Fetch page blocks to find child databases
  blocks = []
  response = notion_client.block_children(block_id: content_page_id, page_size: 100)
  blocks.concat(response['results'] || [])
  
  # Handle pagination
  while response['has_more'] && response['next_cursor']
    response = notion_client.block_children(
      block_id: content_page_id,
      page_size: 100,
      start_cursor: response['next_cursor']
    )
    blocks.concat(response['results'] || [])
  end

  # Look for a database block with the specified name in the title
  blocks.each do |block|
    if block['type'] == 'child_database'
      title = block['child_database']['title'] || ''
      if title.downcase.include?(database_name.downcase)
        return block['id']
      end
    end
  end

  raise "#{database_name.capitalize} database not found in CONTENT_NOTION_URL page"
end

def find_chirps_database_id(content_page_id)
  find_database_id(content_page_id, 'chirp')
end

def find_posts_database_id(content_page_id)
  find_database_id(content_page_id, 'post')
end

def find_notion_page_by_title(content_page_id, page_title)
  # Fetch page blocks to find child pages
  blocks = []
  response = notion_client.block_children(block_id: content_page_id, page_size: 100)
  blocks.concat(response['results'] || [])
  
  # Handle pagination
  while response['has_more'] && response['next_cursor']
    response = notion_client.block_children(
      block_id: content_page_id,
      page_size: 100,
      start_cursor: response['next_cursor']
    )
    blocks.concat(response['results'] || [])
  end

  # Look for a child page with the specified title
  blocks.each do |block|
    if block['type'] == 'child_page'
      title = block['child_page']['title'] || ''
      if title.downcase == page_title.downcase
        return block['id']
      end
    end
  end

  raise "#{page_title} page not found in CONTENT_NOTION_URL page"
end

def fetch_notion_page_by_name(page_name)
  content_notion_url = ENV['CONTENT_NOTION_URL']
  raise "CONTENT_NOTION_URL not found in environment variables" if content_notion_url.nil? || content_notion_url.empty?

  content_page_id = extract_page_id_from_notion_url(content_notion_url)
  page_id = find_notion_page_by_title(content_page_id, page_name)
  
  # Fetch the page
  page_response = notion_client.page(page_id: page_id)
  page = page_response
  
  # Get page properties
  properties = page['properties'] || {}
  last_edited_time = page['last_edited_time'] || page[:last_edited_time]
  
  # Create cache key with timestamp to ensure cache invalidation when page is updated
  cache_key = "page_#{page_name}_#{last_edited_time}"
  
  # Check cache
  cached_result = $cache.read(cache_key)
  return cached_result if cached_result
  
  # Get title
  title = nil
  properties.each do |prop_name, prop|
    if prop['type'] == 'title' || prop[:type] == 'title'
      title = prop['title']&.first&.[]('plain_text') if prop['title']&.any?
      break if title
    end
  end
  title ||= page_name.capitalize
  
  # Get date if available
  date = extract_property_value(properties, ['date', 'Date', 'created_time', 'Created Time'], 'date') do |prop|
    prop['date']&.[]('start') if prop['date']
  end || extract_property_value(properties, ['date', 'Date', 'created_time', 'Created Time'], 'created_time') do |prop|
    prop['created_time'] if prop['created_time']
  end || Time.now.iso8601
  
  # Fetch content with caching
  content = read_page_content_cache(page_id, last_edited_time)
  
  if content.nil?
    content = fetch_notion_page_content(page_id)
    write_page_content_cache(page_id, content, last_edited_time)
  end
  
  result = {
    'title' => title,
    'date' => date,
    'html' => content, # content is now HTML directly from notion_to_html
    'path' => "/#{page_name.downcase}",
    'id' => page_id
  }
  
  $cache.write(cache_key, result)
  result
end

def extract_property_value(properties, names, type, &extractor)
  names.each do |prop_name|
    prop = properties[prop_name] || properties[prop_name.to_sym]
    next unless prop
    prop_type = prop['type'] || prop[:type]
    next unless prop_type == type
    value = extractor.call(prop)
    return value if value
  end
  nil
end

def parse_notion_item(page, path_prefix)
  properties = page['properties'] || {}
  page_id = page['id']
  last_edited_time = page['last_edited_time'] || page[:last_edited_time]
  
  # First, try to find any property of type 'title' (title is usually the first property in Notion databases)
  title = nil
  properties.each do |prop_name, prop|
    if prop['type'] == 'title' || prop[:type] == 'title'
      title = prop['title']&.first&.[]('plain_text') if prop['title']&.any?
      break if title
    end
  end
  
  # If not found, try common property names
  title ||= extract_property_value(properties, ['title', 'Name', 'Title', 'name', 'content', 'Content'], 'title') do |prop|
    prop['title']&.first&.[]('plain_text') if prop['title']&.any?
  end || extract_property_value(properties, ['title', 'Name', 'Title', 'name', 'content', 'Content'], 'rich_text') do |prop|
    prop['rich_text']&.first&.[]('plain_text') if prop['rich_text']&.any?
  end || 'Untitled'

  date = extract_property_value(properties, ['date', 'Date', 'created_time', 'Created Time'], 'date') do |prop|
    prop['date']&.[]('start') if prop['date']
  end || extract_property_value(properties, ['date', 'Date', 'created_time', 'Created Time'], 'created_time') do |prop|
    prop['created_time'] if prop['created_time']
  end || Time.now.iso8601

  # Content is a Notion page - only fetch if page has been updated
  content = read_page_content_cache(page_id, last_edited_time)
  
  # Fetch content if not cached or if page has been updated
  if content.nil?
    content = fetch_notion_page_content(page_id)
    # Cache the content with its last_edited_time
    write_page_content_cache(page_id, content, last_edited_time)
  end
  
  slug = title != 'Untitled' ? title.downcase.gsub(/[^a-z0-9]+/, '-').gsub(/^-|-$/, '') : page['id'].gsub(/-/, '')
  
  is_draft = extract_property_value(properties, ['draft', 'Draft', 'is_draft', 'Is Draft'], 'checkbox') do |prop|
    prop['checkbox']
  end || false
  
  tags = extract_property_value(properties, ['tags', 'Tags', 'tag', 'Tag', 'categories', 'Categories'], 'multi_select') do |prop|
    prop['multi_select']&.map { |t| t['name'] }&.sort if prop['multi_select']&.any?
  end || []
  
  {
    'title' => title,
    'date' => date,
    'html' => content, # content is now HTML directly from notion_to_html
    'path' => "#{path_prefix}/#{slug}",
    'draft' => is_draft,
    'tags' => tags,
    'id' => page_id
  }
end

def fetch_items_from_notion_database(database_name, path_prefix)
  content_notion_url = ENV['CONTENT_NOTION_URL']
  raise "CONTENT_NOTION_URL not found in environment variables" if content_notion_url.nil? || content_notion_url.empty?

  content_page_id = extract_page_id_from_notion_url(content_notion_url)
  
  # Get content page's last_edited_time to include in cache key
  # This ensures cache is invalidated if page structure changes
  content_page = notion_client.page(page_id: content_page_id)
  content_page_last_edited = content_page['last_edited_time'] || content_page[:last_edited_time] || Time.now.iso8601
  
  # Create cache key with timestamp to ensure cache invalidation when page structure changes
  cache_key = "#{database_name}_#{path_prefix}_#{content_page_last_edited}"
  
  # Check cache
  cached_items = $cache.read(cache_key)
  return cached_items if cached_items
  
  # Cache database ID with content page timestamp in key
  database_id_key = "#{content_page_id}_#{database_name}_#{content_page_last_edited}"
  database_id = $cache.read(database_id_key)
  unless database_id
    database_id = find_database_id(content_page_id, database_name)
    # Use a very long cache duration since the timestamp in the key handles invalidation
    $cache.write(database_id_key, database_id)
  end

  # Query Notion database
  pages = []
  response = notion_client.database_query(
    database_id: database_id,
    sorts: [{ 'property' => 'date', 'direction' => 'descending' }],
    page_size: 100
  )
  pages.concat(response['results'] || [])
  
  # Handle pagination
  while response['has_more'] && response['next_cursor']
    response = notion_client.database_query(
      database_id: database_id,
      sorts: [{ 'property' => 'date', 'direction' => 'descending' }],
      page_size: 100,
      start_cursor: response['next_cursor']
    )
    pages.concat(response['results'] || [])
  end

  items = pages.map { |page| parse_notion_item(page, path_prefix) }

  $cache.write(cache_key, items)
  items
end

def fetch_chirps_from_notion
  fetch_items_from_notion_database('chirp', '/chirps')
end

def fetch_posts_from_notion
  fetch_items_from_notion_database('post', '/posts')
end

def fetch_block_children(block_id)
  blocks = []
  response = notion_client.block_children(block_id: block_id, page_size: 100)
  blocks.concat(response['results'] || [])
  
  # Handle pagination
  while response['has_more'] && response['next_cursor']
    response = notion_client.block_children(
      block_id: block_id,
      page_size: 100,
      start_cursor: response['next_cursor']
    )
    blocks.concat(response['results'] || [])
  end
  
  blocks
end

def fetch_notion_page_content(page_id)
  blocks = fetch_block_children(page_id)
  convert_blocks_to_html(blocks)
end

def convert_blocks_to_html(blocks)
  # Use notion_to_html gem to convert blocks to HTML
  html_parts = []
  i = 0
  
  while i < blocks.length
    block = blocks[i]
    unless block['type']
      i += 1
      next
    end
    
    # Handle list items by grouping consecutive items of the same type
    if block['type'] == 'bulleted_list_item'
      list_items = []
      while i < blocks.length && blocks[i]['type'] == 'bulleted_list_item'
        begin
          item_html = convert_block_to_html_with_gem(blocks[i])
          list_items << item_html
        rescue => e
          item_html = convert_block_to_html_manual(blocks[i])
          list_items << item_html
        end
        i += 1
      end
      html_parts << "<ul>#{list_items.join('')}</ul>" unless list_items.empty?
      next
    elsif block['type'] == 'numbered_list_item'
      list_items = []
      while i < blocks.length && blocks[i]['type'] == 'numbered_list_item'
        begin
          item_html = convert_block_to_html_with_gem(blocks[i])
          list_items << item_html
        rescue => e
          item_html = convert_block_to_html_manual(blocks[i])
          list_items << item_html
        end
        i += 1
      end
      html_parts << "<ol>#{list_items.join('')}</ol>" unless list_items.empty?
      next
    else
      # Use the gem's renderers to convert each block to HTML
      begin
        # Try to use the gem's block renderer if available
        if defined?(NotionToHtml::Renderer)
          renderer = NotionToHtml::Renderer.new(block)
          html_parts << renderer.render if renderer.respond_to?(:render)
        else
          # Fallback: use the gem's service if renderer is not directly accessible
          # Convert block using the gem's formatting methods
          html_parts << convert_block_to_html_with_gem(block)
        end
      rescue => e
        # Fallback to manual conversion if gem fails
        html_parts << convert_block_to_html_manual(block)
      end
      i += 1
    end
  end

  html_parts.join("\n")
end

def convert_block_to_html_with_gem(block)
  # Use notion_to_html gem's block conversion
  # The gem should handle rich_text formatting, line breaks, etc.
  block_type = block['type']
  block_data = block[block_type] || {}
  rich_text = block_data['rich_text'] || []
  
  # Convert rich_text to HTML with proper formatting
  text_content = rich_text.map do |rt|
    text = rt['plain_text'] || ''
    annotations = rt['annotations'] || {}
    
    # Apply formatting based on annotations
    if annotations['bold']
      text = "<strong>#{text}</strong>"
    end
    if annotations['italic']
      text = "<em>#{text}</em>"
    end
    if annotations['code']
      text = "<code>#{text}</code>"
    end
    if rt['href']
      text = "<a href=\"#{rt['href']}\">#{text}</a>"
    end
    
    text
  end.join('')
  
  # Handle line breaks in text (replace \n with <br>)
  text_content = text_content.gsub(/\n/, '<br>')
  
  # Check if block has children (for nested lists)
  nested_content = ''
  if block['has_children']
    child_blocks = fetch_block_children(block['id'])
    nested_content = convert_blocks_to_html(child_blocks)
  end
  
  case block_type
  when 'paragraph'
    "<p>#{text_content}</p>"
  when 'heading_1'
    "<h1>#{text_content}</h1>"
  when 'heading_2'
    "<h2>#{text_content}</h2>"
  when 'heading_3'
    "<h3>#{text_content}</h3>"
  when 'bulleted_list_item'
    "<li>#{text_content}#{nested_content}</li>"
  when 'numbered_list_item'
    "<li>#{text_content}#{nested_content}</li>"
  when 'code'
    language = block_data['language'] || ''
    code_text = rich_text.map { |rt| rt['plain_text'] || '' }.join('')
    "<pre><code class=\"language-#{language}\">#{code_text}</code></pre>"
  when 'quote'
    "<blockquote>#{text_content}</blockquote>"
  else
    "<p>#{text_content}</p>"
  end
end

def convert_block_to_html_manual(block)
  # Manual fallback conversion
  block_type = block['type']
  block_data = block[block_type] || {}
  rich_text = block_data['rich_text'] || []
  text = rich_text.map { |rt| rt['plain_text'] || '' }.join('')
  text = text.gsub(/\n/, '<br>')
  
  # Check if block has children (for nested lists)
  nested_content = ''
  if block['has_children']
    child_blocks = fetch_block_children(block['id'])
    nested_content = convert_blocks_to_html(child_blocks)
  end
  
  case block_type
  when 'paragraph'
    "<p>#{text}</p>"
  when 'heading_1'
    "<h1>#{text}</h1>"
  when 'heading_2'
    "<h2>#{text}</h2>"
  when 'heading_3'
    "<h3>#{text}</h3>"
  when 'bulleted_list_item'
    "<li>#{text}#{nested_content}</li>"
  when 'numbered_list_item'
    "<li>#{text}#{nested_content}</li>"
  when 'code'
    language = block_data['language'] || ''
    "<pre><code class=\"language-#{language}\">#{text}</code></pre>"
  when 'quote'
    "<blockquote>#{text}</blockquote>"
  else
    "<p>#{text}</p>"
  end
end

def fetch_chirp_by_slug(slug)
  chirps = fetch_chirps_from_notion
  chirp = chirps.find { |c| c['path'] == "/chirps/#{slug}" }
  return chirp
end

def fetch_post_by_slug(slug)
  posts = fetch_posts_from_notion
  post = posts.find { |p| p['path'] == "/posts/#{slug}" }
  return post
end

configure do
  set :bind, '0.0.0.0'
  set :host_authorization, { permitted_hosts: [] }
  set :public_folder, File.expand_path('static', File.dirname(__FILE__))
  Liquid::Template.file_system = Liquid::LocalFileSystem.new(File.join(settings.root, "templates"))
  # set :views, File.join(File.dirname(__FILE__), '/templates')
  set :views, "templates"
end

error 500 do
  liquid :error_500
end

module LiquidFilters
  def asset_url(file)
    asset_hash = cached_asset_hash(file) || "nohash"
    "/#{file}?v=#{asset_hash}"
  end

  def sort_by(entities, key, direction='desc')
    sorted_entities = entities.sort_by { |e| e[key] }
    direction == 'desc' ? sorted_entities.reverse : sorted_entities
  end

  def format_time(time, format = '%b %d, %Y')
    return '' if time.nil?
    Time.parse(time).strftime(format)
  end

  private

  def cached_asset_hash(file)
    @asset_hashes ||= {}
    return @asset_hashes[file] if @asset_hashes.key?(file)

    # public_folder = settings.public_folder
    public_folder = File.expand_path('static', File.dirname(__FILE__))
    asset_path = File.join(public_folder, file)
    if File.exist?(asset_path)
      @asset_hashes[file] = Digest::MD5.file(asset_path).hexdigest[0, 10]
    else
      @asset_hashes[file] = nil
    end
  end
end

Liquid::Template.register_filter(LiquidFilters)

get '/' do
  begin
    posts = fetch_posts_from_notion
    liquid :index, locals: { posts: posts, show_profile: true }
  rescue => e
    status 500
    "Error fetching posts: #{e.message}"
  end
end

get '/posts/:post_slug' do
  begin
    post_slug = params[:post_slug]
    post = fetch_post_by_slug(post_slug)
    if post.nil?
      status 404
      "Post not found"
    else
      liquid :post, locals: post
    end
  rescue => e
    status 500
    "Error fetching post: #{e.message}"
  end
end

get '/shelf' do
  begin
    page = fetch_notion_page_by_name('shelf')
    liquid :shelf, locals: page
  rescue => e
    status 500
    "Error fetching shelf: #{e.message}"
  end
end

get '/about' do
  begin
    page = fetch_notion_page_by_name('about')
    liquid :about, locals: page
  rescue => e
    status 500
    "Error fetching about: #{e.message}"
  end
end

get '/chirps' do
  begin
    chirps = fetch_chirps_from_notion
    liquid :chirps, locals: { chirps: chirps }
  rescue => e
    status 500
    "Error fetching chirps: #{e.message}"
  end
end

get '/chirps/:chirp_slug' do
  begin
    chirp_slug = params[:chirp_slug]
    chirp = fetch_chirp_by_slug(chirp_slug)
    if chirp.nil?
      status 404
      "Chirp not found"
    else
      liquid :chirp, locals: chirp
    end
  rescue => e
    status 500
    "Error fetching chirp: #{e.message}"
  end
end

get '/oops' do
  liquid :error_500
end
