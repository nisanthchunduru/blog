import { Cache } from './cache';
import { Content } from './entity';

export async function fetchCachedPageByName(cache: Cache, pageName: string): Promise<Content> {
  const cacheKey = `page_${pageName}`;
  const result = await cache.read(cacheKey);
  if (!result) {
    throw new Error(`Page ${pageName} not found in cache`);
  }
  return result as Content;
}
