def notion_client
  @notion_client ||= Notion::Client.new(token: ENV['NOTION_TOKEN'])
end

def fetch_cached_page_blocks(page_id, last_edited_time)
  cache_key = "page_#{page_id}_#{last_edited_time}_blocks"
  $cache.fetch(cache_key) do
    fetch_notion_page_blocks(page_id)
  end
end

def extract_page_id_from_notion_url(url)
  uuid_match = url.match(/-([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i)
  if uuid_match
    return uuid_match[1]
  end

  hex_match = url.match(/-([a-f0-9]{32})$/i)
  if hex_match
    id = hex_match[1]
    return "#{id[0..7]}-#{id[8..11]}-#{id[12..15]}-#{id[16..19]}-#{id[20..31]}"
  end

  raise "Could not extract page ID from Notion URL: #{url}"
end

def find_database_id(content_page_id, database_name)
  blocks = []
  response = notion_client.block_children(block_id: content_page_id, page_size: 100)
  blocks.concat(response['results'] || [])

  while response['has_more'] && response['next_cursor']
    response = notion_client.block_children(
      block_id: content_page_id,
      page_size: 100,
      start_cursor: response['next_cursor']
    )
    blocks.concat(response['results'] || [])
  end

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
  blocks = []
  response = notion_client.block_children(block_id: content_page_id, page_size: 100)
  blocks.concat(response['results'] || [])

  while response['has_more'] && response['next_cursor']
    response = notion_client.block_children(
      block_id: content_page_id,
      page_size: 100,
      start_cursor: response['next_cursor']
    )
    blocks.concat(response['results'] || [])
  end

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

  page_response = notion_client.page(page_id: page_id)
  page = page_response

  properties = page['properties'] || {}
  last_edited_time = page['last_edited_time'] || page[:last_edited_time]

  cache_key = "page_#{page_name}_#{last_edited_time}"
  $cache.fetch(cache_key) do
    title = nil
    properties.each do |prop_name, prop|
      if prop['type'] == 'title' || prop[:type] == 'title'
        title = prop['title']&.first&.[]('plain_text') if prop['title']&.any?
        break if title
      end
    end
    title ||= page_name.capitalize

    date_prop = properties['date'] || properties['Date'] || properties['created_time'] || properties['Created Time']
    date = if date_prop
      if date_prop['type'] == 'date' && date_prop['date']
        date_prop['date']['start']
      elsif date_prop['type'] == 'created_time'
        date_prop['created_time']
      end
    end
    date ||= Time.now.iso8601

    blocks = fetch_cached_page_blocks(page_id, last_edited_time)
    content = format_notion_blocks(blocks)

    {
      'title' => title,
      'date' => date,
      'html' => content,
      'path' => "/#{page_name.downcase}",
      'id' => page_id
    }
  end
end

def fetch_notion_database_pages(database_name)
  content_notion_url = ENV['CONTENT_NOTION_URL']
  raise "CONTENT_NOTION_URL not found in environment variables" if content_notion_url.nil? || content_notion_url.empty?

  content_page_id = extract_page_id_from_notion_url(content_notion_url)
  content_page = notion_client.page(page_id: content_page_id)
  content_page_last_edited = content_page['last_edited_time'] || content_page[:last_edited_time] || Time.now.iso8601

  database_id_key = "#{content_page_id}_#{database_name}_#{content_page_last_edited}"
  database_id = $cache.fetch(database_id_key) do
    find_database_id(content_page_id, database_name)
  end

  # Don't cache the database query results - we cache individual pages instead
  pages = []
  response = notion_client.database_query(
    database_id: database_id,
    sorts: [{ 'property' => 'date', 'direction' => 'descending' }],
    page_size: 100
  )
  pages.concat(response['results'] || [])

  while response['has_more'] && response['next_cursor']
    response = notion_client.database_query(
      database_id: database_id,
      sorts: [{ 'property' => 'date', 'direction' => 'descending' }],
      page_size: 100,
      start_cursor: response['next_cursor']
    )
    pages.concat(response['results'] || [])
  end

  pages
end

def load_entity_notion_database_schema(entity_name)
  schema_path = File.join(File.dirname(__FILE__), 'config', 'notion_database_schemas', "#{entity_name}.yaml")
  YAML.load_file(schema_path)
end

def fetch_entity_props(page_props, prop_schema)
  prop_names = prop_schema['names'] || []
  prop_type = prop_schema['type']
  extract_method = prop_schema['extract']
  default_value = prop_schema['default']

  prop_names.each do |name|
    prop = page_props[name]
    next unless prop
    next unless prop['type'] == prop_type

    case prop_type
    when 'date'
      date_value = prop['date']
      return date_value['start'] if date_value && extract_method == 'start'
    when 'checkbox'
      return prop['checkbox']
    when 'multi_select'
      multi_select_value = prop['multi_select']
      if multi_select_value && extract_method == 'names_sorted'
        return multi_select_value.map { |item| item['name'] }.sort
      end
    end
  end

  default_value
end

def process_entity_page(page, path_prefix, properties_schema)
  properties = page['properties'] || {}
  page_id = page['id']
  last_edited_time = page['last_edited_time'] || page[:last_edited_time]

  cache_key = "entity_#{page_id}_#{last_edited_time}"

  $cache.fetch(cache_key) do
    extracted_props = {}

    properties_schema.each do |prop_name, prop_schema|
      next unless prop_schema

      if prop_name == 'content' && prop_schema['required']
        blocks = fetch_cached_page_blocks(page_id, last_edited_time)
        return nil if blocks.nil? || blocks.empty?
        content = format_notion_blocks(blocks)
        extracted_props['content'] = content
      else
        value = fetch_entity_props(properties, prop_schema)
        if prop_schema['required'] && (value.nil? || (value.respond_to?(:empty?) && value.empty?))
          return nil
        end
        extracted_props[prop_name] = value
      end
    end

    title = nil
    properties.each do |prop_name, prop|
      if prop['type'] == 'title' || prop[:type] == 'title'
        title = prop['title']&.first&.[]('plain_text') if prop['title']&.any?
        break if title
      end
    end
    title ||= 'Untitled'

    title_slug = title != 'Untitled' ? title.downcase.gsub(/[^a-z0-9]+/, '-').gsub(/^-|-$/, '') : ''
    short_id = page_id.gsub(/-/, '')[0..7]
    slug = "#{short_id}-#{title_slug}".gsub(/-+$/, '')

    {
      'title' => title,
      'date' => extracted_props['date'],
      'html' => extracted_props['content'],
      'path' => "#{path_prefix}/#{slug}",
      'draft' => extracted_props['draft'],
      'tags' => extracted_props['tags'],
      'id' => page_id
    }
  end
end

def fetch_entities(entity_name)
  entity_schema = load_entity_notion_database_schema(entity_name)
  database_name = entity_schema['database_name']
  path_prefix = entity_schema['path_prefix']
  properties_schema = entity_schema['properties'] || {}

  pages = fetch_notion_database_pages(database_name)

  pages.filter_map do |page|
    process_entity_page(page, path_prefix, properties_schema)
  end
end
