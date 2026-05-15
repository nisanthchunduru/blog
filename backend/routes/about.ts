import { Router } from 'express'
import { createCache } from '../cache_factory.js'
import { jsonApiError, jsonApiResponse, serializeAbout } from '../jsonapi.js'

const router = Router()
const cache = createCache()

router.get('/', async (req, res) => {
  try {
    const page = await cache.read('page_about') as { html: string } | null
    if (!page) {
      return jsonApiError(res, 404, 'About page not found')
    }
    jsonApiResponse(res, serializeAbout(page, req))
  } catch (error) {
    jsonApiError(res, 500, 'Failed to fetch about page')
  }
})

export default router
