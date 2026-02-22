import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Cache } from './cache.js';

export class S3Cache implements Cache {
  private client: S3Client;
  private bucket: string;

  constructor(bucket: string) {
    this.bucket = bucket;
    this.client = new S3Client({});
  }

  async read(key: string): Promise<unknown> {
    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: `${key}.json`,
        })
      );
      const body = await response.Body?.transformToString();
      if (!body) return null;
      return JSON.parse(body);
    } catch (error: any) {
      if (error.name === 'NoSuchKey') return null;
      throw error;
    }
  }

  async write(key: string, value: unknown): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: `${key}.json`,
        Body: JSON.stringify(value),
        ContentType: 'application/json',
      })
    );
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
    return `s3://${this.bucket}`;
  }
}
