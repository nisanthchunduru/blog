import type { LoaderFunctionArgs } from 'react-router-dom'
import type { Book, Chirp, Post } from '../types'

type HtmlPage = {
  html: string
}

export type HomePageData = {
  page: HtmlPage
  chirps: Chirp[]
  posts: Post[]
}

const cachedApiResponses = new Map<string, { expiresAt: number; responsePromise: Promise<unknown> }>()
const apiCacheDurationInMilliseconds = 60_000

async function fetchCachedJson<ResponseBody>(requestPath: string): Promise<ResponseBody> {
  const cachedResponse = cachedApiResponses.get(requestPath) as { expiresAt: number; responsePromise: Promise<ResponseBody> } | undefined
  if (cachedResponse && cachedResponse.expiresAt > Date.now()) return cachedResponse.responsePromise
  const responsePromise = fetch(requestPath)
    .then(async (response) => {
      if (!response.ok) throw new Error(`Unable to fetch ${requestPath}`)
      return response.json() as Promise<ResponseBody>
    })
    .catch((error) => {
      cachedApiResponses.delete(requestPath)
      throw error
    })
  cachedApiResponses.set(requestPath, {
    expiresAt: Date.now() + apiCacheDurationInMilliseconds,
    responsePromise,
  })
  return responsePromise
}

export function loadHomePageData(): Promise<HomePageData> {
  return Promise.all([
    fetchCachedJson<HtmlPage>('/api/about'),
    fetchCachedJson<Chirp[]>('/api/chirps'),
    fetchCachedJson<Post[]>('/api/posts'),
  ]).then(([page, chirps, posts]) => ({ page, chirps, posts }))
}

export function loadPostsPageData(): Promise<Post[]> {
  return fetchCachedJson<Post[]>('/api/posts')
}

export function loadPostDetails(postSlug?: string): Promise<Post | null> {
  if (!postSlug) return Promise.resolve(null)
  return fetchCachedJson<Post | null>(`/api/posts/${postSlug}`)
}

export function loadPostPageData({ params }: LoaderFunctionArgs): Promise<Post | null> {
  return loadPostDetails(params.slug)
}

export function loadChirpsPageData(): Promise<Chirp[]> {
  return fetchCachedJson<Chirp[]>('/api/chirps')
}

export function loadChirpDetails(chirpSlug?: string): Promise<Chirp | null> {
  if (!chirpSlug) return Promise.resolve(null)
  return fetchCachedJson<Chirp | null>(`/api/chirps/${chirpSlug}`)
}

export function loadChirpPageData({ params }: LoaderFunctionArgs): Promise<Chirp | null> {
  return loadChirpDetails(params.slug)
}

export function loadLibraryPageData(): Promise<Book[]> {
  return fetchCachedJson<Book[]>('/api/library')
}
