import pluralize from 'pluralize';
import slugify from 'slugify';
import { Cache, NullCache } from './cache';
import { Book, Chirp, Entity, Post } from './entity';
import { formatNotionBlocks } from './notion_page_html_utils';
import { EntitySchema, NotionPage, fetchCachedPageBlocks, fetchEntityProps, fetchNotionDatabasePages, getNotionClient, loadEntityNotionDatabaseSchema } from './notion_utils';

export async function transformNotionPageToEntity<T extends Entity>(
  page: NotionPage,
  entitySchema: EntitySchema,
  entityName: string,
  options: { cache?: Cache } = {}
): Promise<T | null> {
  const cache = options.cache || new NullCache();
  const properties = page.properties || {};
  const pageId = page.id;
  const lastEditedTime = page.last_edited_time || '';
  const propertiesSchema = entitySchema.itemProperties || {};

  const cacheKey = `entity_${pageId}_${lastEditedTime}`;

  return cache.fetch(cacheKey, async () => {
    const entityProperties: Record<string, unknown> = {};

    for (const propName in propertiesSchema) {
      const propSchema = propertiesSchema[propName];
      if (!propSchema) continue;

      if (propName === 'content' && propSchema.required) {
        const blocks = await fetchCachedPageBlocks(pageId, lastEditedTime, { cache });
        if (!blocks || blocks.length === 0) {
          return null;
        }
        const content = await formatNotionBlocks(getNotionClient(), blocks as any[]);
        entityProperties.content = content;
      } else {
        const extractedPropertyValue = fetchEntityProps(properties, propSchema);
        if (propSchema.required && (extractedPropertyValue === null || extractedPropertyValue === undefined || (Array.isArray(extractedPropertyValue) && extractedPropertyValue.length === 0) || (typeof extractedPropertyValue === 'string' && extractedPropertyValue.trim() === ''))) {
          return null;
        }
        entityProperties[propName] = extractedPropertyValue;
      }
    }

    let title: string | null = null;
    for (const propName in properties) {
      const notionProperty = properties[propName] as { type?: string; title?: Array<{ plain_text?: string }> };
      if (notionProperty.type === 'title') {
        if (notionProperty.title && notionProperty.title.length > 0) {
          title = notionProperty.title[0].plain_text || null;
          break;
        }
      }
    }
    title = title || 'Untitled';

    const titleSlug = title !== 'Untitled'
      ? slugify(title, { lower: true, strict: true })
      : '';
    const shortId = pageId.replace(/-/g, '').substring(0, 8);
    const slug = `${shortId}-${titleSlug}`.replace(/-+$/, '');

    const publishedDate = entityProperties.date as string;

    return {
      id: pageId,
      name: entityName,
      title: title,
      publishedDate: publishedDate,
      html: entityProperties.content as string,
      slug: slug,
      draft: entityProperties.draft as boolean | undefined,
      tags: entityProperties.tags as string[] | undefined
    } as unknown as T;
  });
}

export async function fetchEntities<T extends Entity>(
  entityName: string,
  options: { cache?: Cache; sortProperty?: string | null } = {}
): Promise<T[]> {
  const cache = options.cache || new NullCache();
  const entitySchema = loadEntityNotionDatabaseSchema(entityName);
  const databaseName = entitySchema.name;
  const pages = await fetchNotionDatabasePages(databaseName, { cache, sortProperty: options.sortProperty });

  const entities: T[] = [];
  for (const page of pages) {
    let entity: T | null;
    if (entityName === 'library') {
      entity = await transformNotionPageToBook(page, { cache }) as T | null;
    } else {
      entity = await transformNotionPageToEntity<T>(page, entitySchema, entityName, { cache });
    }
    if (entity) {
      entities.push(entity);
    }
  }

  return entities;
}

export async function fetchPosts(
  options: { cache?: Cache } = {}
): Promise<Post[]> {
  return fetchEntities<Post>('post', options);
}

export async function fetchChirps(
  options: { cache?: Cache } = {}
): Promise<Chirp[]> {
  return fetchEntities<Chirp>('chirp', options);
}

export async function transformNotionPageToPost(
  page: NotionPage,
  options: { cache?: Cache } = {}
): Promise<Post | null> {
  const entitySchema = loadEntityNotionDatabaseSchema('post');
  return transformNotionPageToEntity<Post>(page, entitySchema, 'post', options);
}

export async function transformNotionPageToChirp(
  page: NotionPage,
  options: { cache?: Cache } = {}
): Promise<Chirp | null> {
  const entitySchema = loadEntityNotionDatabaseSchema('chirp');
  return transformNotionPageToEntity<Chirp>(page, entitySchema, 'chirp', options);
}

export async function transformNotionPageToBook(
  page: NotionPage,
  options: { cache?: Cache } = {}
): Promise<Book | null> {
  const cache = options.cache || new NullCache();
  const properties = page.properties || {};
  const pageId = page.id;
  const lastEditedTime = page.last_edited_time || '';
  const entitySchema = loadEntityNotionDatabaseSchema('library');
  const propertiesSchema = entitySchema.itemProperties || {};

  const cacheKey = `book_${pageId}_${lastEditedTime}`;

  return cache.fetch(cacheKey, async () => {
    let title: string | null = null;
    for (const propName in properties) {
      const notionProperty = properties[propName] as { type?: string; title?: Array<{ plain_text?: string }> };
      if (notionProperty.type === 'title') {
        if (notionProperty.title && notionProperty.title.length > 0) {
          title = notionProperty.title[0].plain_text || null;
          break;
        }
      }
    }
    if (!title || title.trim() === '') {
      return null;
    }

    const authorsSchema = propertiesSchema.authors;
    let authors: string | undefined;
    if (authorsSchema) {
      const extractedAuthors = fetchEntityProps(properties, authorsSchema);
      if (extractedAuthors && typeof extractedAuthors === 'string' && extractedAuthors.trim() !== '') {
        authors = extractedAuthors;
      }
    }

    return {
      id: pageId,
      name: 'library',
      title: title,
      authors: authors
    };
  });
}

export async function fetchBooks(
  options: { cache?: Cache } = {}
): Promise<Book[]> {
  return fetchEntities<Book>('library', { cache: options.cache, sortProperty: null });
}

export async function fetchEntitiesFromCache<T extends Entity>(
  entityName: string,
  cache: Cache
): Promise<T[]> {
  const pluralizedEntityName = pluralize(entityName);
  const cachedEntities = await cache.read(pluralizedEntityName) as T[];
  if (!cachedEntities) {
    throw new Error(`${pluralizedEntityName} entities not found in cache`);
  }
  return cachedEntities;
}

export async function fetchPostsFromCache(cache: Cache): Promise<Post[]> {
  return fetchEntitiesFromCache<Post>('post', cache);
}

export async function fetchChirpsFromCache(cache: Cache): Promise<Chirp[]> {
  return fetchEntitiesFromCache<Chirp>('chirp', cache);
}

export async function fetchBooksFromCache(cache: Cache): Promise<Book[]> {
  return fetchEntitiesFromCache<Book>('library', cache);
}
