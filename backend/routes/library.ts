import { Router } from 'express'
import { createCache } from '../cache_factory.js'
import { fetchCachedEntities } from '../cached-entity-utils.js'
import { Book } from '../entity.js'

const router = Router()
const cache = createCache()

router.get('/', async (req, res) => {
  try {
    const items = await fetchCachedEntities<Book>(cache, 'library')
    res.json(items)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch library items' })
  }
})

export default router
