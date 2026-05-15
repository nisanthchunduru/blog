import { Router } from 'express'
import { createCache } from '../cache_factory.js'
import { fetchCachedEntities, fetchCachedEntityBySlug } from '../cached-entity-utils.js'
import { jsonApiError, jsonApiResponse, serializeChirps } from '../jsonapi.js'
import { Chirp } from '../entity.js'

const router = Router()
const cache = createCache()

router.get('/', async (req, res) => {
  try {
    const chirps = await fetchCachedEntities<Chirp>(cache, 'chirp')
    jsonApiResponse(res, serializeChirps(chirps, req))
  } catch (error) {
    jsonApiError(res, 500, 'Failed to fetch chirps')
  }
})

router.get('/:slug', async (req, res) => {
  try {
    const chirp = await fetchCachedEntityBySlug<Chirp>(cache, 'chirp', req.params.slug)
    if (!chirp) {
      return jsonApiError(res, 404, 'Chirp not found')
    }
    jsonApiResponse(res, serializeChirps(chirp, req))
  } catch (error) {
    jsonApiError(res, 500, 'Failed to fetch chirp')
  }
})

export default router
