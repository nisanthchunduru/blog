import { Cache } from './cache';
import pluralize from 'pluralize';

export async function fetchCachedEntities<T>(cache: Cache, entityName: string): Promise<T[]> {
  const cacheKey = pluralize(entityName);
  const result = await cache.read(cacheKey);
  if (!result || !Array.isArray(result)) {
    throw new Error(`${entityName} not found in cache`);
  }
  return result as T[];
}

export async function fetchCachedEntityBySlug<T>(cache: Cache, entityName: string, slug: string): Promise<T | null> {
  const cacheKey = `${entityName}_${slug}`;
  const result = await cache.read(cacheKey);
  if (!result) {
    return null;
  }
  return result as T;
}
