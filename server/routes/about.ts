import { Router } from 'express'
import { FilesystemCache } from '../../backend/filesystem_cache'

const router = Router()
const cache = new FilesystemCache()

router.get('/', async (req, res) => {
  try {
    const page = await cache.read('page_about')
    if (!page) {
      return res.status(404).json({ error: 'About page not found' })
    }
    res.json(page)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch about page' })
  }
})

export default router
