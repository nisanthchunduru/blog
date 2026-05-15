import { Cache } from './cache.js'
import { DynamoDBCache } from './dynamodb_cache.js'
import { FilesystemCache } from './filesystem_cache.js'
import { S3Cache } from './s3_cache.js'

export function createCache(): Cache {
  const dynamoTable = process.env.CACHE_DYNAMODB_TABLE
  const s3Bucket = process.env.CACHE_S3_BUCKET
  if (dynamoTable) {
    return new DynamoDBCache(dynamoTable)
  }
  if (s3Bucket) {
    return new S3Cache(s3Bucket)
  }
  return new FilesystemCache()
}
