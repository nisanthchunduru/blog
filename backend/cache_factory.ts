import { Cache } from './cache.js';
import { FilesystemCache } from './filesystem_cache.js';
import { S3Cache } from './s3_cache.js';

export function createCache(): Cache {
  const s3Bucket = process.env.CACHE_S3_BUCKET;
  if (s3Bucket) {
    return new S3Cache(s3Bucket);
  }
  return new FilesystemCache();
}
