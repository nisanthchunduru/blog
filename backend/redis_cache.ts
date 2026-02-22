import Redis from 'ioredis';
import { Cache } from './cache.js';

const TTL_SECONDS = 30 * 24 * 60 * 60;

export class RedisCache implements Cache {
  private client: Redis;

  constructor(redisUrl: string) {
    const [host, port] = redisUrl.split(':')
    this.client = new Redis({
      host,
      port: parseInt(port, 10),
      tls: {},
      connectTimeout: 5000,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    })
  }

  async read(key: string): Promise<unknown> {
    const raw = await this.client.get(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  }

  async write(key: string, value: unknown): Promise<void> {
    await this.client.setex(key, TTL_SECONDS, JSON.stringify(value));
  }

  async fetch<T>(key: string, block?: () => T | Promise<T>): Promise<T | null> {
    const cached = await this.read(key);
    if (cached !== null) return cached as T;
    if (!block) return null;
    const value = await block();
    await this.write(key, value);
    return value;
  }

  getCacheDir(): string {
    return '';
  }
}
