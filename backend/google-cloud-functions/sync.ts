import type { Request, Response } from 'express'
import { createCache } from '../cache_factory.js'
import { syncCache } from '../daemons/sync.js'

export async function run(_request: Request, response: Response): Promise<void> {
  try {
    await syncCache(createCache())
    response.status(200).json({ synced: true })
  } catch (error) {
    console.error('Error syncing cache:', error)
    response.status(500).json({ synced: false })
  }
}
