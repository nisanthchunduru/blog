import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { Cache } from './cache.js'

const TTL_DAYS = 30

export class DynamoDBCache implements Cache {
  private client: DynamoDBClient
  private tableName: string

  constructor(tableName: string, client?: DynamoDBClient) {
    this.tableName = tableName
    this.client = client ?? new DynamoDBClient({})
  }

  async read(key: string): Promise<unknown> {
    try {
      const response = await this.client.send(
        new GetItemCommand({
          TableName: this.tableName,
          Key: marshall({ id: key }),
        })
      )
      if (!response.Item) return null
      const item = unmarshall(response.Item)
      return item.value ?? null
    } catch (error) {
      throw error
    }
  }

  async write(key: string, value: unknown): Promise<void> {
    const ttl = Math.floor(Date.now() / 1000) + TTL_DAYS * 24 * 60 * 60
    await this.client.send(
      new PutItemCommand({
        TableName: this.tableName,
        Item: marshall(
          {
            id: key,
            value,
            ttl,
          },
          { removeUndefinedValues: true }
        ),
      })
    )
  }

  async fetch<T>(key: string, block?: () => T | Promise<T>): Promise<T | null> {
    const cached = await this.read(key)
    if (cached !== null) return cached as T
    if (!block) return null
    const value = await block()
    await this.write(key, value)
    return value
  }

  getCacheDir(): string {
    return `dynamodb://${this.tableName}`
  }
}
