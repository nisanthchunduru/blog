import { Router } from 'express'
import { createCache } from '../cache_factory.js'
import { fetchCachedEntities, fetchCachedEntityBySlug } from '../cached-entity-utils.js'
import { jsonApiError, jsonApiResponse, serializePosts } from '../jsonapi.js'
import { Post } from '../entity.js'

const router = Router()
const cache = createCache()

router.get('/', async (req, res) => {
  try {
    const posts = await fetchCachedEntities<Post>(cache, 'post')
    jsonApiResponse(res, serializePosts(posts, req))
  } catch (error) {
    console.error('Error fetching posts:', error)
    jsonApiError(res, 500, 'Failed to fetch posts')
  }
})

router.get('/:slug', async (req, res) => {
  try {
    const post = await fetchCachedEntityBySlug<Post>(cache, 'post', req.params.slug)
    if (!post) {
      return jsonApiError(res, 404, 'Post not found')
    }
    jsonApiResponse(res, serializePosts(post, req))
  } catch (error) {
    jsonApiError(res, 500, 'Failed to fetch post')
  }
})

export default router
