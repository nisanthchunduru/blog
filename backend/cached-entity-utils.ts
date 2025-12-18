import pluralize from 'pluralize';
import { Cache } from './cache';

export async function fetchCachedEntities<T>(cache: Cache, entityName: string): Promise<T[]> {
  const pluralizedEntityName = pluralize(entityName);
  const cacheKey = pluralizedEntityName;
  const result = await cache.read(cacheKey);
  if (!result || !Array.isArray(result)) {
    throw new Error(`"${entityName}" entities not found in cache`);
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
