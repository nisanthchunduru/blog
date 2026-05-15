import type { CloudFrontRequestEvent, CloudFrontRequestResult } from 'aws-lambda'

declare const __CSS_FILE__: string
declare const __JS_FILE__: string
declare const __VENDOR_FILE__: string

const CSS_FILE = typeof __CSS_FILE__ !== 'undefined' ? __CSS_FILE__ : 'main.css'
const JS_FILE = typeof __JS_FILE__ !== 'undefined' ? __JS_FILE__ : 'main.js'
const VENDOR_FILE = typeof __VENDOR_FILE__ !== 'undefined' ? __VENDOR_FILE__ : 'vendor.js'

const API_BASE_URL = 'https://nisanthchunduru.com'
const STATIC_EXTENSIONS = /\.(js|css|svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot|map|json|txt|xml|webp|avif)$/i

interface JsonApiResource {
  id: string
  type: string
  attributes?: Record<string, unknown>
}

interface JsonApiDocument {
  data: JsonApiResource | JsonApiResource[]
}

function parseJsonApiDocument(document: JsonApiDocument): unknown {
  const { data } = document
  if (Array.isArray(data)) {
    return data.map((resource) => ({
      id: resource.id,
      ...resource.attributes,
    }))
  }
  return {
    id: data.id,
    ...data.attributes,
  }
}

const jsonApiHeaders = { Accept: 'application/vnd.api+json' }

function buildFieldsUrl(path: string, resourceType: string, fields: string[]): string {
  const params = new URLSearchParams()
  params.set(`fields[${resourceType}]`, fields.join(','))
  return `${path}?${params.toString()}`
}

const postListFields = ['id', 'name', 'title', 'slug', 'publishedDate', 'subheading', 'tags', 'draft']
const bookListFields = ['id', 'title', 'authors']

async function fetchJsonApi<T>(requestPath: string): Promise<T> {
  const fullPath = API_BASE_URL + requestPath
  const response = await fetch(fullPath, { headers: jsonApiHeaders })
  if (!response.ok) throw new Error(`Unable to fetch ${fullPath}`)
  const document = await response.json()
  return parseJsonApiDocument(document) as T
}

interface RouteData {
  title: string
  description: string
  data: unknown
}

async function getRouteData(uri: string): Promise<RouteData | null> {
  const normalizedUri = uri === '/' ? '/' : uri.replace(/\/$/, '')
  if (normalizedUri === '/') {
    const [page, chirps, posts] = await Promise.all([
      fetchJsonApi<{ html: string }>('/api/about'),
      fetchJsonApi<unknown[]>('/api/chirps'),
      fetchJsonApi<unknown[]>(buildFieldsUrl('/api/posts', 'posts', postListFields)),
    ])
    return {
      title: 'Nisanth Chunduru',
      description: "Nisanth Chunduru's Blog",
      data: { page, chirps, posts },
    }
  }
  if (normalizedUri === '/posts') {
    const posts = await fetchJsonApi<unknown[]>(buildFieldsUrl('/api/posts', 'posts', postListFields))
    return {
      title: 'Posts | Nisanth Chunduru',
      description: 'Blog posts by Nisanth Chunduru',
      data: posts,
    }
  }
  const postMatch = normalizedUri.match(/^\/posts\/(.+)$/)
  if (postMatch) {
    const post = await fetchJsonApi<{ title?: string; subheading?: string }>(`/api/posts/${postMatch[1]}`)
    return {
      title: post?.title ? `${post.title} | Nisanth Chunduru` : 'Post | Nisanth Chunduru',
      description: post?.subheading || 'A blog post by Nisanth Chunduru',
      data: post,
    }
  }
  if (normalizedUri === '/chirps') {
    const chirps = await fetchJsonApi<unknown[]>('/api/chirps')
    return {
      title: 'Chirps | Nisanth Chunduru',
      description: 'Short thoughts and notes',
      data: chirps,
    }
  }
  const chirpMatch = normalizedUri.match(/^\/chirps\/(.+)$/)
  if (chirpMatch) {
    const chirp = await fetchJsonApi<{ title?: string }>(`/api/chirps/${chirpMatch[1]}`)
    return {
      title: chirp?.title ? `${chirp.title} | Nisanth Chunduru` : 'Chirp | Nisanth Chunduru',
      description: 'A chirp by Nisanth Chunduru',
      data: chirp,
    }
  }
  if (normalizedUri === '/library') {
    const books = await fetchJsonApi<unknown[]>(buildFieldsUrl('/api/library', 'library', bookListFields))
    return {
      title: 'Library | Nisanth Chunduru',
      description: 'Books read by Nisanth Chunduru',
      data: books,
    }
  }
  return null
}

function buildHtml(routeData: RouteData | null, is404: boolean): string {
  const title = routeData?.title || (is404 ? '404 - Not Found | Nisanth Chunduru' : 'Nisanth Chunduru')
  const description = routeData?.description || "Nisanth Chunduru's Blog"
  const dataScript = routeData?.data
    ? `<script>window.__SSR_DATA__ = ${JSON.stringify(routeData.data).replace(/</g, '\\u003c')};</script>`
    : ''
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <script>
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    </script>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
    <link rel="modulepreload" href="/assets/${VENDOR_FILE}" />
    <link rel="stylesheet" href="/assets/${CSS_FILE}" />
  </head>
  <body>
    <div id="root"></div>
    <script>window.__SSR__ = true;</script>
    ${dataScript}
    <script type="module" src="/assets/${JS_FILE}"></script>
  </body>
</html>`
}

export async function handler(event: CloudFrontRequestEvent): Promise<CloudFrontRequestResult> {
  const request = event.Records[0].cf.request
  const uri = request.uri
  console.log('SSR Handler - URI:', uri)
  if (STATIC_EXTENSIONS.test(uri) || uri.startsWith('/api/') || uri.startsWith('/assets/')) {
    console.log('SSR Handler - Passing through to origin')
    return request
  }
  try {
    console.log('SSR Handler - Fetching route data for:', uri)
    const routeData = await getRouteData(uri)
    const is404 = routeData === null
    console.log('SSR Handler - Route data:', routeData ? 'found' : 'null (404)', 'title:', routeData?.title)
    const html = buildHtml(routeData, is404)
    return {
      status: is404 ? '404' : '200',
      statusDescription: is404 ? 'Not Found' : 'OK',
      headers: {
        'content-type': [{ key: 'Content-Type', value: 'text/html; charset=utf-8' }],
        'cache-control': [{ key: 'Cache-Control', value: 'public, max-age=60' }],
      },
      body: html,
    }
  } catch (error) {
    console.error('SSR Error:', error, 'URI:', uri)
    return request
  }
}
