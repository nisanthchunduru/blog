import type { LoaderFunctionArgs } from 'react-router-dom'
import { parseJsonApiDocument } from '../api/jsonapi'
import type { BookListItem, Chirp, Post, PostListItem } from '../types'

type HtmlPage = {
  html: string
}

export type HomePageData = {
  page: HtmlPage
  chirps: Chirp[]
  posts: PostListItem[]
}

const cachedApiResponses = new Map<string, { expiresAt: number; responsePromise: Promise<unknown> }>()
const apiCacheDurationInMilliseconds = 60_000

const jsonApiHeaders = { Accept: 'application/vnd.api+json' }

function buildFieldsUrl(path: string, resourceType: string, fields: string[]): string {
  const params = new URLSearchParams()
  params.set(`fields[${resourceType}]`, fields.join(','))
  return `${path}?${params.toString()}`
}

const postListFields = ['id', 'name', 'title', 'slug', 'publishedDate', 'subheading', 'tags', 'draft'] as const
const bookListFields = ['id', 'title', 'authors'] as const

function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return globalThis.__API_BASE_URL__ || ''
  }
  return ''
}

async function fetchJsonApi<ResponseBody>(requestPath: string): Promise<ResponseBody> {
  const baseUrl = getApiBaseUrl()
  const fullPath = baseUrl + requestPath
  const cachedResponse = cachedApiResponses.get(fullPath) as { expiresAt: number; responsePromise: Promise<ResponseBody> } | undefined
  if (cachedResponse && cachedResponse.expiresAt > Date.now()) return cachedResponse.responsePromise
  const responsePromise = fetch(fullPath, { headers: jsonApiHeaders })
    .then(async (response) => {
      if (!response.ok) throw new Error(`Unable to fetch ${fullPath}`)
      const document = await response.json()
      return parseJsonApiDocument(document) as ResponseBody
    })
    .catch((error) => {
      cachedApiResponses.delete(fullPath)
      throw error
    })
  cachedApiResponses.set(fullPath, {
    expiresAt: Date.now() + apiCacheDurationInMilliseconds,
    responsePromise,
  })
  return responsePromise
}

export function loadHomePageData(): Promise<HomePageData> {
  return Promise.all([
    fetchJsonApi<HtmlPage>('/api/about'),
    fetchJsonApi<Chirp[]>('/api/chirps'),
    fetchJsonApi<PostListItem[]>(buildFieldsUrl('/api/posts', 'posts', [...postListFields])),
  ]).then(([page, chirps, posts]) => ({ page, chirps, posts }))
}

export function loadPostsPageData(): Promise<PostListItem[]> {
  return fetchJsonApi<PostListItem[]>(buildFieldsUrl('/api/posts', 'posts', [...postListFields]))
}

export function loadPostDetails(postSlug?: string): Promise<Post | null> {
  if (!postSlug) return Promise.resolve(null)
  return fetchJsonApi<Post | null>(`/api/posts/${postSlug}`)
}

export function loadPostPageData({ params }: LoaderFunctionArgs): Promise<Post | null> {
  return loadPostDetails(params.slug)
}

export function loadChirpsPageData(): Promise<Chirp[]> {
  return fetchJsonApi<Chirp[]>('/api/chirps')
}

export function loadChirpDetails(chirpSlug?: string): Promise<Chirp | null> {
  if (!chirpSlug) return Promise.resolve(null)
  return fetchJsonApi<Chirp | null>(`/api/chirps/${chirpSlug}`)
}

export function loadChirpPageData({ params }: LoaderFunctionArgs): Promise<Chirp | null> {
  return loadChirpDetails(params.slug)
}

export function loadLibraryPageData(): Promise<BookListItem[]> {
  return fetchJsonApi<BookListItem[]>(buildFieldsUrl('/api/library', 'library', [...bookListFields]))
}

export function setApiBaseUrl(url: string): void {
  globalThis.__API_BASE_URL__ = url
}

declare global {
  var __API_BASE_URL__: string | undefined
}
