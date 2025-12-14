class RichTextConverter
  def self.convert(rich_text)
    rich_text.map do |rt|
      text = rt['plain_text'] || ''
      annotations = rt['annotations'] || {}

      text = "<strong>#{text}</strong>" if annotations['bold']
      text = "<em>#{text}</em>" if annotations['italic']
      text = "<code>#{text}</code>" if annotations['code']
      text = "<a href=\"#{rt['href']}\">#{text}</a>" if rt['href']

      text
    end.join('').gsub(/\n/, '<br>')
  end
end

class ParagraphBlockConverter
  def self.convert(block_data, _nested_content)
    text_content = RichTextConverter.convert(block_data['rich_text'] || [])
    "<p>#{text_content}</p>"
  end
end

class HeadingBlockConverter
  def self.convert(block_data, _nested_content, level)
    text_content = RichTextConverter.convert(block_data['rich_text'] || [])
    "<h#{level}>#{text_content}</h#{level}>"
  end
end

class ListItemBlockConverter
  def self.convert(block_data, nested_content)
    text_content = RichTextConverter.convert(block_data['rich_text'] || [])
    "<li>#{text_content}#{nested_content}</li>"
  end
end

class CodeBlockConverter
  def self.convert(block_data, _nested_content)
    language = block_data['language'] || ''
    code_text = (block_data['rich_text'] || []).map { |rt| rt['plain_text'] || '' }.join('')
    "<pre><code class=\"language-#{language}\">#{code_text}</code></pre>"
  end
end

class QuoteBlockConverter
  def self.convert(block_data, _nested_content)
    text_content = RichTextConverter.convert(block_data['rich_text'] || [])
    "<blockquote>#{text_content}</blockquote>"
  end
end

class BlockToHtmlConverter
  CONVERTERS = {
    'paragraph' => ParagraphBlockConverter,
    'heading_1' => HeadingBlockConverter,
    'heading_2' => HeadingBlockConverter,
    'heading_3' => HeadingBlockConverter,
    'bulleted_list_item' => ListItemBlockConverter,
    'numbered_list_item' => ListItemBlockConverter,
    'code' => CodeBlockConverter,
    'quote' => QuoteBlockConverter
  }.freeze

  def initialize(notion_client)
    @notion_client = notion_client
  end

  def fetch_block_children(block_id)
    blocks = []
    response = @notion_client.block_children(block_id: block_id, page_size: 100)
    blocks.concat(response['results'] || [])

    while response['has_more'] && response['next_cursor']
      response = @notion_client.block_children(
        block_id: block_id,
        page_size: 100,
        start_cursor: response['next_cursor']
      )
      blocks.concat(response['results'] || [])
    end

    blocks
  end

  def convert_blocks_to_html(blocks)
    html_parts = []
    i = 0

    while i < blocks.length
      block = blocks[i]
      unless block['type']
        i += 1
        next
      end

      case block['type']
      when 'bulleted_list_item'
        list_items = []
        while i < blocks.length && blocks[i]['type'] == 'bulleted_list_item'
          item_html = convert_block_to_html(blocks[i])
          list_items << item_html
          i += 1
        end
        html_parts << "<ul>#{list_items.join('')}</ul>" unless list_items.empty?
      when 'numbered_list_item'
        list_items = []
        while i < blocks.length && blocks[i]['type'] == 'numbered_list_item'
          item_html = convert_block_to_html(blocks[i])
          list_items << item_html
          i += 1
        end
        html_parts << "<ol>#{list_items.join('')}</ol>" unless list_items.empty?
      else
        html_parts << convert_block_to_html(block)
        i += 1
      end
    end

    html_parts.join("\n")
  end

  def convert_block_to_html(block)
    block_type = block['type']
    block_data = block[block_type] || {}

    nested_content = ''
    if block['has_children']
      child_blocks = fetch_block_children(block['id'])
      nested_content = convert_blocks_to_html(child_blocks)
    end

    converter = CONVERTERS[block_type]
    if converter
      case block_type
      when 'heading_1'
        converter.convert(block_data, nested_content, 1)
      when 'heading_2'
        converter.convert(block_data, nested_content, 2)
      when 'heading_3'
        converter.convert(block_data, nested_content, 3)
      else
        converter.convert(block_data, nested_content)
      end
    else
      ParagraphBlockConverter.convert(block_data, nested_content)
    end
  end
end

def fetch_block_children(block_id)
  converter = BlockToHtmlConverter.new(notion_client)
  converter.fetch_block_children(block_id)
end

def convert_blocks_to_html(blocks)
  converter = BlockToHtmlConverter.new(notion_client)
  converter.convert_blocks_to_html(blocks)
end

def fetch_notion_page_blocks(page_id)
  fetch_block_children(page_id)
end

def format_notion_blocks(blocks)
  convert_blocks_to_html(blocks)
end

def fetch_notion_page_content(page_id)
  blocks = fetch_notion_page_blocks(page_id)
  format_notion_blocks(blocks)
end
