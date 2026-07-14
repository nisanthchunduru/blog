import { Router } from 'express'
import { createCache } from '../cache_factory.js'
import { fetchCachedEntities, fetchCachedEntityBySlug } from '../cached-entity-utils.js'
import { sortBy, formatTime, getReadingTime } from '../utils.js'
import type { Post, Chirp, Book } from '../entity.js'

const router = Router()
const cache = createCache()
const CACHE_CONTROL = 'public, max-age=60, stale-while-revalidate=31536000'

router.use((_req, res, next) => {
  res.set('Cache-Control', CACHE_CONTROL)
  next()
})

function groupChirpsByMonth(chirps: Chirp[]): { monthAndYear: string; chirps: Chirp[] }[] {
  return chirps.reduce<{ monthAndYear: string; chirps: Chirp[] }[]>((groups, chirp) => {
    const monthAndYear = new Date(chirp.publishedDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    })
    const currentGroup = groups[groups.length - 1]
    if (currentGroup?.monthAndYear === monthAndYear) {
      currentGroup.chirps.push(chirp)
      return groups
    }
    return [...groups, { monthAndYear, chirps: [chirp] }]
  }, [])
}

function groupPostsByYear(posts: Post[]): [number, Post[]][] {
  const grouped = new Map<number, Post[]>()
  for (const post of posts) {
    const year = new Date(post.publishedDate).getFullYear()
    const existing = grouped.get(year) ?? []
    grouped.set(year, [...existing, post])
  }
  return [...grouped.entries()].sort(([a], [b]) => b - a)
}

router.get('/', async (req, res) => {
  try {
    const aboutPage = await cache.read('page_about') as { html: string } | null
    res.render('pages/about', {
      aboutHtml: aboutPage?.html ?? '',
      title: 'Home',
      currentPath: req.path,
    })
  } catch (error) {
    console.error('Error rendering home:', error)
    res.status(500).send('Internal server error')
  }
})

router.get('/posts', async (req, res) => {
  try {
    const posts = await fetchCachedEntities<Post>(cache, 'post')
    const publishedPosts = sortBy(posts.filter(p => !p.draft), 'publishedDate', 'desc')
    const yearGroups = groupPostsByYear(publishedPosts)
    res.render('pages/posts/index', {
      yearGroups,
      formatTime,
      getReadingTime,
      title: 'Posts',
      currentPath: req.path,
    })
  } catch (error) {
    console.error('Error rendering posts:', error)
    res.status(500).send('Internal server error')
  }
})

router.get('/posts/:slug', async (req, res) => {
  try {
    const post = await fetchCachedEntityBySlug<Post>(cache, 'post', req.params.slug)
    if (!post) {
      return res.status(404).render('pages/404', { title: 'Not Found', currentPath: req.path })
    }
    res.render('pages/posts/show', {
      post,
      formatTime,
      getReadingTime,
      title: post.title,
      description: post.subheading,
      ogTitle: post.title,
      currentPath: req.path,
    })
  } catch (error) {
    console.error('Error rendering post:', error)
    res.status(500).send('Internal server error')
  }
})

router.get('/chirps', async (req, res) => {
  try {
    const chirps = await fetchCachedEntities<Chirp>(cache, 'chirp')
    const publishedChirps = sortBy(chirps.filter(c => !c.draft), 'publishedDate', 'desc')
    const chirpGroups = groupChirpsByMonth(publishedChirps)
    res.render('pages/chirps/index', {
      chirpGroups,
      formatTime,
      title: 'Chirps',
      currentPath: req.path,
    })
  } catch (error) {
    console.error('Error rendering chirps:', error)
    res.status(500).send('Internal server error')
  }
})

router.get('/library', async (req, res) => {
  try {
    const books = await fetchCachedEntities<Book>(cache, 'library')
    res.render('pages/library/index', {
      books,
      title: 'Library',
      currentPath: req.path,
    })
  } catch (error) {
    console.error('Error rendering library:', error)
    res.status(500).send('Internal server error')
  }
})

export default router
