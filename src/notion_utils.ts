import { Client } from '@notionhq/client';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { Cache, NullCache } from './cache';
import { fetchNotionPageBlocks, formatNotionBlocks } from './notion_page_html_utils';
import { Content } from './entity';

export interface EntitySchema {
  name: string;
  itemProperties: Record<string, PropertySchema>;
}

export interface PropertySchema {
  names?: string[];
  type: string;
  extract?: string;
  default?: unknown;
  required?: boolean;
}

export interface NotionPage {
  id: string;
  properties: Record<string, unknown>;
  last_edited_time?: string;
  [key: string]: unknown;
}

interface NotionBlock {
  id: string;
  type: string;
  [key: string]: unknown;
}

let notionClient: Client | null = null;

export function getNotionClient(): Client {
  if (!notionClient) {
    const token = process.env.NOTION_TOKEN;
    if (!token) {
      throw new Error('NOTION_TOKEN not found in environment variables');
    }
    notionClient = new Client({ auth: token });
  }
  return notionClient;
}

export async function fetchCachedPageBlocks(
  pageId: string,
  lastEditedTime: string,
  options: { cache?: Cache } = {}
): Promise<unknown[]> {
  const cache = options.cache || new NullCache();
  const cacheKey = `page_${pageId}_${lastEditedTime}_blocks`;
  return cache.fetch(cacheKey, async () => {
    return fetchNotionPageBlocks(getNotionClient(), pageId);
  });
}

export function extractPageIdFromNotionUrl(url: string): string {
  const uuidMatch = url.match(/-([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i);
  if (uuidMatch) {
    return uuidMatch[1];
  }

  const hexMatch = url.match(/-([a-f0-9]{32})$/i);
  if (hexMatch) {
    const id = hexMatch[1];
    return `${id.substring(0, 8)}-${id.substring(8, 12)}-${id.substring(12, 16)}-${id.substring(16, 20)}-${id.substring(20, 32)}`;
  }

  throw new Error(`Could not extract page ID from Notion URL: ${url}`);
}

export async function findDatabaseId(
  contentPageId: string,
  databaseName: string
): Promise<string> {
  const client = getNotionClient();
  const blocks = await fetchAllBlocks(client, contentPageId);

  for (const block of blocks) {
    if (block.type === 'child_database') {
      const title = block.child_database?.title || '';
      if (title.toLowerCase().includes(databaseName.toLowerCase())) {
        return block.id;
      }
    }
  }

  throw new Error(`${databaseName.charAt(0).toUpperCase() + databaseName.slice(1)} database not found in CONTENT_NOTION_URL page`);
}

export async function findNotionPageByTitle(
  contentPageId: string,
  pageTitle: string
): Promise<string> {
  const client = getNotionClient();
  const blocks = await fetchAllBlocks(client, contentPageId);

  for (const block of blocks) {
    if (block.type === 'child_page') {
      const title = block.child_page?.title || '';
      if (title.toLowerCase() === pageTitle.toLowerCase()) {
        return block.id;
      }
    }
  }

  throw new Error(`${pageTitle} page not found in CONTENT_NOTION_URL page`);
}

export async function fetchNotionPageByName(
  pageName: string,
  options: { cache?: Cache } = {}
): Promise<Content> {
  const cache = options.cache || new NullCache();
  const contentNotionUrl = process.env.CONTENT_NOTION_URL;
  if (!contentNotionUrl || contentNotionUrl.trim() === '') {
    throw new Error('CONTENT_NOTION_URL not found in environment variables');
  }

  const contentPageId = extractPageIdFromNotionUrl(contentNotionUrl);
  const pageId = await findNotionPageByTitle(contentPageId, pageName);

  const client = getNotionClient();
  const pageResponse = await client.pages.retrieve({ page_id: pageId });
  const page = pageResponse as NotionPage;

  const properties = page.properties || {};
  const lastEditedTime = page.last_edited_time || '';

  const cacheKey = `page_${pageName}_${lastEditedTime}`;
  return cache.fetch(cacheKey, async () => {
    let title: string | null = null;
    for (const propName in properties) {
      const notionProperty = properties[propName];
      if (notionProperty.type === 'title' || (notionProperty as any).type === 'title') {
        if (notionProperty.title && notionProperty.title.length > 0) {
          title = notionProperty.title[0].plain_text;
          break;
        }
      }
    }
    title = title || pageName.charAt(0).toUpperCase() + pageName.slice(1);

    const publishedDateProperty = (properties.date || properties.Date || properties.created_time || properties['Created Time']) as 
      { type?: string; date?: { start?: string }; created_time?: string } | undefined;
    let publishedDate: string;
    if (publishedDateProperty) {
      if (publishedDateProperty.type === 'date' && publishedDateProperty.date?.start) {
        publishedDate = publishedDateProperty.date.start;
      } else if (publishedDateProperty.type === 'created_time' && publishedDateProperty.created_time) {
        publishedDate = publishedDateProperty.created_time;
      } else {
        publishedDate = new Date().toISOString();
      }
    } else {
      publishedDate = new Date().toISOString();
    }

    const blocks = await fetchCachedPageBlocks(pageId, lastEditedTime, { cache });
    const content = await formatNotionBlocks(getNotionClient(), blocks);

    return {
      id: pageId,
      name: pageName.toLowerCase(),
      title: title,
      publishedDate: publishedDate,
      html: content,
      slug: pageName.toLowerCase()
    };
  });
}

export async function fetchNotionDatabasePages(
  databaseName: string,
  options: { cache?: Cache } = {}
): Promise<NotionPage[]> {
  const cache = options.cache || new NullCache();
  const contentNotionUrl = process.env.CONTENT_NOTION_URL;
  if (!contentNotionUrl || contentNotionUrl.trim() === '') {
    throw new Error('CONTENT_NOTION_URL not found in environment variables');
  }

  const contentPageId = extractPageIdFromNotionUrl(contentNotionUrl);
  const client = getNotionClient();
  const contentPage = await client.pages.retrieve({ page_id: contentPageId });
  const contentPageLastEdited = (contentPage as NotionPage).last_edited_time || new Date().toISOString();

  const databaseIdKey = `${contentPageId}_${databaseName}_${contentPageLastEdited}`;
  const databaseId = await cache.fetch(databaseIdKey, async () => {
    return findDatabaseId(contentPageId, databaseName);
  });

  return fetchAllDatabasePages(client, databaseId);
}

export function loadEntityNotionDatabaseSchema(entityName: string): EntitySchema {
  const schemaPath = path.join(__dirname, '..', 'config', 'notion_database_schemas', `${entityName}.yaml`);
  const fileContents = fs.readFileSync(schemaPath, 'utf8');
  return yaml.load(fileContents) as EntitySchema;
}

export function fetchEntityProps(pageProps: Record<string, unknown>, propSchema: PropertySchema): unknown {
  const propNames = propSchema.names || [];
  const propType = propSchema.type;
  const extractMethod = propSchema.extract;
  const defaultValue = propSchema.default;

  for (const name of propNames) {
    const notionProperty = pageProps[name];
    if (!notionProperty) continue;
    if (notionProperty.type !== propType) continue;

    switch (propType) {
      case 'date':
        const datePropertyValue = notionProperty.date as { start?: string } | undefined;
        if (datePropertyValue && extractMethod === 'start') {
          return datePropertyValue.start;
        }
        break;
      case 'checkbox':
        return notionProperty.checkbox;
      case 'multi_select':
        const multiSelectValue = notionProperty.multi_select as Array<{ name: string }>;
        if (multiSelectValue && extractMethod === 'names_sorted') {
          return multiSelectValue.map((tagOption) => tagOption.name).sort();
        }
        break;
    }
  }

  return defaultValue;
}

export async function fetchAllBlocks(client: Client, blockId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let response = await client.blocks.children.list({
    block_id: blockId,
    page_size: 100
  });
  blocks.push(...(response.results as NotionBlock[]));

  while (response.has_more && response.next_cursor) {
    response = await client.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      start_cursor: response.next_cursor
    });
    blocks.push(...(response.results as NotionBlock[]));
  }

  return blocks;
}

export async function fetchAllDatabasePages(client: Client, databaseId: string): Promise<NotionPage[]> {
  const pages: NotionPage[] = [];
  let response = await client.databases.query({
    database_id: databaseId,
    sorts: [{ property: 'date', direction: 'descending' }],
    page_size: 100
  });
  pages.push(...(response.results as NotionPage[]));

  while (response.has_more && response.next_cursor) {
    response = await client.databases.query({
      database_id: databaseId,
      sorts: [{ property: 'date', direction: 'descending' }],
      page_size: 100,
      start_cursor: response.next_cursor
    });
    pages.push(...(response.results as NotionPage[]));
  }

  return pages;
}

export { fetchPosts, fetchChirps, transformNotionPageToPost, transformNotionPageToChirp, transformNotionPageToEntity, fetchEntities } from './entity-utils';
