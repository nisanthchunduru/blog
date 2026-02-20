import dotenv from 'dotenv';
import pluralize from 'pluralize';
import { Cache } from '../cache';
import { Entity } from '../entity';
import { fetchEntities } from '../entity-utils';
import { FilesystemCache } from '../filesystem_cache';
import { fetchNotionPageByName } from '../notion_utils';

dotenv.config();

async function cacheEntities<T extends Entity>(cache: Cache, entityName: string, options: { sortProperty?: string | null } = {}): Promise<void> {
  try {
    const entities = await fetchEntities<T>(entityName, { cache, sortProperty: options.sortProperty });
    await cache.write(pluralize(entityName), entities);
    for (const entity of entities) {
      if ('slug' in entity && entity.slug) {
        await cache.write(`${entityName}_${entity.slug}`, entity);
      }
    }
    console.log(`Cached ${entities.length} ${entityName}s`);
  } catch (error) {
    console.error(`Error caching ${entityName}:`, error);
  }
}

async function cachePageByName(cache: Cache, pageName: string): Promise<void> {
  try {
    const page = await fetchNotionPageByName(pageName, { cache });
    await cache.write(`page_${pageName}`, page);
    console.log(`Cached "${pageName}" page`);
  } catch (error) {
    console.error(`Error caching page ${pageName}:`, error);
  }
}

async function syncCache(cache: Cache): Promise<void> {
  console.log('Starting cache sync...');
  await Promise.all([
    cacheEntities(cache, 'post'),
    cacheEntities(cache, 'chirp'),
    cacheEntities(cache, 'library', { sortProperty: null }),
    cachePageByName(cache, 'about')
  ]);
  console.log('Cache sync completed');
}

export function startSync(cache: Cache, intervalSeconds: number = 30): void {
  console.log(`Starting sync daemon with ${intervalSeconds} second interval`);
  syncCache(cache);
  setInterval(() => {
    syncCache(cache);
  }, intervalSeconds * 1000);
}

if (process.argv[1]?.includes('sync.ts')) {
  const cache = new FilesystemCache();
  const syncInterval = parseInt(process.env.SYNC_INTERVAL || '30', 10);
  startSync(cache, syncInterval);
}
