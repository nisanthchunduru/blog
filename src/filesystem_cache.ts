import * as path from 'path';
import * as fs from 'fs';
import Cache from 'file-system-cache';
import { Cache as CacheInterface } from './cache';

const DEFAULT_CACHE_DURATION = 30 * 24 * 60 * 60;

function getCacheDir(): string {
  return path.join(__dirname, '..', 'tmp', 'cache');
}

export class FilesystemCache implements CacheInterface {
  private cache: any;
  private cacheDuration: number;
  private basePath: string;

  constructor(cacheDir?: string, cacheDuration: number = DEFAULT_CACHE_DURATION) {
    this.cacheDuration = cacheDuration;
    this.basePath = cacheDir || getCacheDir();
    
    fs.mkdirSync(this.basePath, { recursive: true });
    
    this.cache = Cache({
      basePath: this.basePath,
      ttl: cacheDuration
    });
  }

  async read(key: string): Promise<unknown> {
    try {
      return await this.cache.get(key);
    } catch (error) {
      return null;
    }
  }

  async write(key: string, value: unknown): Promise<void> {
    try {
      await this.cache.set(key, value, this.cacheDuration);
    } catch (error) {
    }
  }

  async fetch<T>(key: string, block?: () => T | Promise<T>): Promise<T | null> {
    try {
      const cachedValue = await this.cache.get(key);
      if (cachedValue !== null && cachedValue !== undefined) {
        return cachedValue;
      }
    } catch (error) {
    }

    if (!block) {
      return null;
    }

    const value = await block();
    await this.write(key, value);
    return value;
  }

  getCacheDir(): string {
    return this.basePath;
  }
}
