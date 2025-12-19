import { Router } from 'express'
import { fetchCachedEntities } from '../../backend/cached-entity-utils'
import { Book } from '../../backend/entity'
import { FilesystemCache } from '../../backend/filesystem_cache'

const router = Router()
const cache = new FilesystemCache()

router.get('/', async (req, res) => {
  try {
    const items = await fetchCachedEntities<Book>(cache, 'library')
    res.json(items)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch library items' })
  }
})

export default router
