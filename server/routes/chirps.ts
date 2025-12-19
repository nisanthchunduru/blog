import { Router } from 'express'
import { fetchCachedEntities, fetchCachedEntityBySlug } from '../../backend/cached-entity-utils'
import { Chirp } from '../../backend/entity'
import { FilesystemCache } from '../../backend/filesystem_cache'

const router = Router()
const cache = new FilesystemCache()

router.get('/', async (req, res) => {
  try {
    const chirps = await fetchCachedEntities<Chirp>(cache, 'chirp')
    res.json(chirps)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chirps' })
  }
})

router.get('/:slug', async (req, res) => {
  try {
    const chirp = await fetchCachedEntityBySlug<Chirp>(cache, 'chirp', req.params.slug)
    if (!chirp) {
      return res.status(404).json({ error: 'Chirp not found' })
    }
    res.json(chirp)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chirp' })
  }
})

export default router
