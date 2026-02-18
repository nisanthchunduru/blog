import { Router } from 'express'
import { fetchCachedEntities, fetchCachedEntityBySlug } from '../cached-entity-utils'
import { Post } from '../entity'
import { FilesystemCache } from '../filesystem_cache'

const router = Router()
const cache = new FilesystemCache()

router.get('/', async (req, res) => {
  try {
    const posts = await fetchCachedEntities<Post>(cache, 'post')
    res.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    res.status(500).json({ error: 'Failed to fetch posts' })
  }
})

router.get('/:slug', async (req, res) => {
  try {
    const post = await fetchCachedEntityBySlug<Post>(cache, 'post', req.params.slug)
    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }
    res.json(post)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' })
  }
})

export default router
