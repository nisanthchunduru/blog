import { Router } from 'express'
import { createCache } from '../cache_factory.js'
import { fetchCachedEntities } from '../cached-entity-utils.js'
import { jsonApiError, jsonApiResponse, serializeLibrary } from '../jsonapi.js'
import { Book } from '../entity.js'

const router = Router()
const cache = createCache()

router.get('/', async (req, res) => {
  try {
    const items = await fetchCachedEntities<Book>(cache, 'library')
    jsonApiResponse(res, serializeLibrary(items, req))
  } catch (error) {
    jsonApiError(res, 500, 'Failed to fetch library items')
  }
})

export default router
