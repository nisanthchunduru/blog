require 'pry'

require 'sinatra'
require 'liquid'
require 'redcarpet'
require 'dotenv/load'
require 'notion-ruby-client'
require 'uri'
require 'yaml'
require 'digest'
require 'json'
require 'fileutils'
require_relative 'filesystem_cache'
require_relative 'notion_page_html_utils'
require_relative 'notion_utils'

$cache = FilesystemCache.new

def fetch_posts
  fetch_entities('post')
end

def fetch_chirps
  fetch_entities('chirp')
end

def fetch_chirp_by_slug(slug)
  chirps = fetch_chirps
  short_id = slug.split('-').first
  chirp = chirps.find { |c| c['id'].gsub(/-/, '')[0..7] == short_id }
  return chirp
end

def fetch_post_by_slug(slug)
  posts = fetch_posts
  short_id = slug.split('-').first
  post = posts.find { |p| p['id'].gsub(/-/, '')[0..7] == short_id }
  return post
end

configure do
  set :bind, '0.0.0.0'
  set :host_authorization, { permitted_hosts: [] }
  set :public_folder, File.expand_path('static', File.dirname(__FILE__))
  Liquid::Template.file_system = Liquid::LocalFileSystem.new(File.join(settings.root, "templates"))
  set :views, "templates"
end

configure :production do
  set :show_exceptions, false
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
  page = fetch_notion_page_by_name('about')
  liquid :about, locals: page
end

get '/posts' do
  posts = fetch_posts
  liquid :index, locals: { posts: posts }
end

get '/posts/:post_slug' do
  post_slug = params[:post_slug]
  post = fetch_post_by_slug(post_slug)
  if post.nil?
    status 404
    "Post not found"
  else
    liquid :post, locals: post
  end
end

get '/shelf' do
  page = fetch_notion_page_by_name('shelf')
  liquid :shelf, locals: page
end

get '/about' do
  redirect '/'
end

get '/chirps' do
  chirps = fetch_chirps
  liquid :chirps, locals: { chirps: chirps }
end

get '/chirps/:chirp_slug' do
  chirp_slug = params[:chirp_slug]
  chirp = fetch_chirp_by_slug(chirp_slug)
  if chirp.nil?
    status 404
    "Chirp not found"
  else
    liquid :chirp, locals: chirp
  end
end

get '/oops' do
  liquid :error_500
end
