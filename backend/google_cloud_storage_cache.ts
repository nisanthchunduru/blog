import { Storage } from '@google-cloud/storage'
import { Cache } from './cache.js'

const CACHE_OBJECT_PREFIX = 'cache'

function getCacheObjectName(key: string): string {
  return `${CACHE_OBJECT_PREFIX}/${encodeURIComponent(key)}.json`
}

function isMissingCacheObject(error: unknown): boolean {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && Number((error as { code: unknown }).code) === 404
}

export class GoogleCloudStorageCache implements Cache {
  private storage: Storage
  private bucketName: string

  constructor(bucketName: string, storage?: Storage) {
    this.bucketName = bucketName
    this.storage = storage ?? new Storage()
  }

  async read(key: string): Promise<unknown> {
    try {
      const [cacheObjectContents] = await this.storage.bucket(this.bucketName).file(getCacheObjectName(key)).download()
      return JSON.parse(cacheObjectContents.toString('utf8'))
    } catch (error) {
      if (isMissingCacheObject(error)) return null
      throw error
    }
  }

  async write(key: string, value: unknown): Promise<void> {
    await this.storage.bucket(this.bucketName).file(getCacheObjectName(key)).save(JSON.stringify(value), {
      contentType: 'application/json',
      resumable: false,
    })
  }

  async fetch<T>(key: string, block?: () => T | Promise<T>): Promise<T | null> {
    const cachedValue = await this.read(key)
    if (cachedValue !== null) return cachedValue as T
    if (!block) return null
    const value = await block()
    await this.write(key, value)
    return value
  }

  getCacheDir(): string {
    return `gs://${this.bucketName}/${CACHE_OBJECT_PREFIX}`
  }
}
