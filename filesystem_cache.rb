require 'json'
require 'fileutils'
require 'digest'

class FilesystemCache
  DEFAULT_CACHE_DURATION = 30 * 24 * 60 * 60 # 1 month in seconds

  def initialize(cache_dir: nil, cache_duration: DEFAULT_CACHE_DURATION)
    @cache_dir = cache_dir || File.join(File.dirname(__FILE__), 'tmp', 'cache')
    @cache_duration = cache_duration
    FileUtils.mkdir_p(@cache_dir) unless File.directory?(@cache_dir)
  end

  def read(key)
    cache_file = cache_file_path(key)
    return nil unless File.exist?(cache_file)
    
    begin
      cache_data = JSON.parse(File.read(cache_file))
      cache_time = Time.parse(cache_data['timestamp'])
      
      # Check if cache is still valid
      if (Time.now - cache_time) < @cache_duration
        return cache_data['data']
      else
        # Cache expired, delete file
        File.delete(cache_file) if File.exist?(cache_file)
        return nil
      end
    rescue => e
      # If reading fails, delete corrupted cache file
      File.delete(cache_file) if File.exist?(cache_file)
      return nil
    end
  end

  def write(key, data)
    cache_file = cache_file_path(key)
    cache_data = {
      'timestamp' => Time.now.iso8601,
      'data' => data
    }
    File.write(cache_file, JSON.generate(cache_data))
  end

  def fetch(key, &block)
    cached_value = read(key)
    return cached_value unless cached_value.nil?

    return nil unless block_given?

    value = block.call
    write(key, value)
    value
  end

  def cache_dir
    @cache_dir
  end

  private

  def cache_file_path(key)
    # Sanitize key for filesystem
    safe_key = key.gsub(/[^a-zA-Z0-9_-]/, '_')
    File.join(@cache_dir, "#{Digest::MD5.hexdigest(safe_key)}.json")
  end
end
