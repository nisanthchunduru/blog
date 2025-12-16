import { Client } from '@notionhq/client';
import { fetchAllBlocks } from './notion_utils';

interface RichText {
  plain_text?: string;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
  };
  href?: string;
}

interface Block {
  type: string;
  id: string;
  has_children?: boolean;
  [key: string]: unknown;
}

interface BlockContent {
  rich_text?: RichText[];
  language?: string;
}

class RichTextConverter {
  static convert(richText: RichText[]): string {
    return richText.map(richTextItem => {
      let text = richTextItem.plain_text || '';
      const annotations = richTextItem.annotations || {};

      if (annotations.bold) {
        text = `<strong>${text}</strong>`;
      }
      if (annotations.italic) {
        text = `<em>${text}</em>`;
      }
      if (annotations.code) {
        text = `<code>${text}</code>`;
      }
      if (richTextItem.href) {
        text = `<a href="${richTextItem.href}">${text}</a>`;
      }

      return text;
    }).join('').replace(/\n/g, '<br>');
  }
}

class ParagraphBlockConverter {
  static convert(blockContent: BlockContent, _nestedContent: string): string {
    const textContent = RichTextConverter.convert(blockContent.rich_text || []);
    return `<p>${textContent}</p>`;
  }
}

class HeadingBlockConverter {
  static convert(blockContent: BlockContent, _nestedContent: string, level: number): string {
    const textContent = RichTextConverter.convert(blockContent.rich_text || []);
    return `<h${level}>${textContent}</h${level}>`;
  }
}

class ListItemBlockConverter {
  static convert(blockContent: BlockContent, nestedContent: string): string {
    const textContent = RichTextConverter.convert(blockContent.rich_text || []);
    return `<li>${textContent}${nestedContent}</li>`;
  }
}

class CodeBlockConverter {
  static convert(blockContent: BlockContent, _nestedContent: string): string {
    const language = blockContent.language || '';
    const codeText = (blockContent.rich_text || []).map((richTextItem: RichText) => richTextItem.plain_text || '').join('');
    return `<pre><code class="language-${language}">${codeText}</code></pre>`;
  }
}

class QuoteBlockConverter {
  static convert(blockContent: BlockContent, _nestedContent: string): string {
    const textContent = RichTextConverter.convert(blockContent.rich_text || []);
    return `<blockquote>${textContent}</blockquote>`;
  }
}

type BlockConverter = {
  convert: (blockContent: BlockContent, nestedContent: string, level?: number) => string;
};

class BlockToHtmlConverter {
  private static CONVERTERS: Record<string, BlockConverter> = {
    'paragraph': ParagraphBlockConverter,
    'heading_1': HeadingBlockConverter,
    'heading_2': HeadingBlockConverter,
    'heading_3': HeadingBlockConverter,
    'bulleted_list_item': ListItemBlockConverter,
    'numbered_list_item': ListItemBlockConverter,
    'code': CodeBlockConverter,
    'quote': QuoteBlockConverter
  };

  constructor(private notionClient: Client) {}

  async fetchBlockChildren(blockId: string): Promise<Block[]> {
    return fetchAllBlocks(this.notionClient, blockId) as Promise<Block[]>;
  }

  async convertBlocksToHtml(blocks: Block[]): Promise<string> {
    const htmlParts: string[] = [];
    let blockIndex = 0;

    while (blockIndex < blocks.length) {
      const block = blocks[blockIndex];
      if (!block.type) {
        blockIndex++;
        continue;
      }

      switch (block.type) {
        case 'bulleted_list_item':
          const bulletedItems: string[] = [];
          while (blockIndex < blocks.length && blocks[blockIndex].type === 'bulleted_list_item') {
            const itemHtml = await this.convertBlockToHtml(blocks[blockIndex]);
            bulletedItems.push(itemHtml);
            blockIndex++;
          }
          if (bulletedItems.length > 0) {
            htmlParts.push(`<ul>${bulletedItems.join('')}</ul>`);
          }
          break;
        case 'numbered_list_item':
          const numberedItems: string[] = [];
          while (blockIndex < blocks.length && blocks[blockIndex].type === 'numbered_list_item') {
            const itemHtml = await this.convertBlockToHtml(blocks[blockIndex]);
            numberedItems.push(itemHtml);
            blockIndex++;
          }
          if (numberedItems.length > 0) {
            htmlParts.push(`<ol>${numberedItems.join('')}</ol>`);
          }
          break;
        default:
          htmlParts.push(await this.convertBlockToHtml(block));
          blockIndex++;
      }
    }

    return htmlParts.join('\n');
  }

  async convertBlockToHtml(block: Block): Promise<string> {
    const blockType = block.type;
    const blockContent = (block[blockType] || {}) as BlockContent;

    let nestedContent = '';
    if (block.has_children) {
      const childBlocks = await this.fetchBlockChildren(block.id);
      nestedContent = await this.convertBlocksToHtml(childBlocks);
    }

    const converter = BlockToHtmlConverter.CONVERTERS[blockType];
    if (converter) {
      switch (blockType) {
        case 'heading_1':
          return converter.convert(blockContent, nestedContent, 1);
        case 'heading_2':
          return converter.convert(blockContent, nestedContent, 2);
        case 'heading_3':
          return converter.convert(blockContent, nestedContent, 3);
        default:
          return converter.convert(blockContent, nestedContent);
      }
    } else {
      return ParagraphBlockConverter.convert(blockContent, nestedContent);
    }
  }
}

export async function fetchBlockChildren(notionClient: Client, blockId: string): Promise<Block[]> {
  const converter = new BlockToHtmlConverter(notionClient);
  return converter.fetchBlockChildren(blockId);
}

export async function convertBlocksToHtml(notionClient: Client, blocks: Block[]): Promise<string> {
  const converter = new BlockToHtmlConverter(notionClient);
  return converter.convertBlocksToHtml(blocks);
}

export async function fetchNotionPageBlocks(notionClient: Client, pageId: string): Promise<Block[]> {
  return fetchBlockChildren(notionClient, pageId);
}

export async function formatNotionBlocks(notionClient: Client, blocks: Block[]): Promise<string> {
  return convertBlocksToHtml(notionClient, blocks);
}

export async function fetchNotionPageContent(notionClient: Client, pageId: string): Promise<string> {
  const blocks = await fetchNotionPageBlocks(notionClient, pageId);
  return formatNotionBlocks(notionClient, blocks);
}
