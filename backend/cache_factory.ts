import { Cache } from './cache.js'
import { DynamoDBCache } from './dynamodb_cache.js'
import { FilesystemCache } from './filesystem_cache.js'
import { GoogleCloudStorageCache } from './google_cloud_storage_cache.js'
import { S3Cache } from './s3_cache.js'

export function createCache(): Cache {
  const dynamoTable = process.env.CACHE_DYNAMODB_TABLE
  const googleCloudStorageBucket = process.env.CACHE_GOOGLE_CLOUD_STORAGE_BUCKET
  const s3Bucket = process.env.CACHE_S3_BUCKET
  if (dynamoTable) {
    return new DynamoDBCache(dynamoTable)
  }
  if (googleCloudStorageBucket) {
    return new GoogleCloudStorageCache(googleCloudStorageBucket)
  }
  if (s3Bucket) {
    return new S3Cache(s3Bucket)
  }
  return new FilesystemCache()
}
