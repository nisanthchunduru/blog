import { matchPath } from 'react-router-dom'
import {
  loadChirpDetails,
  loadChirpsPageData,
  loadHomePageData,
  loadLibraryPageData,
  loadPostDetails,
  loadPostsPageData,
} from './pageDataLoaders'
import { normalizeRoutePath } from './utils'

const prefetchedRouteResources = new Map<string, Promise<void>>()

type RouteDataLoader = (routeParams: Record<string, string | undefined>) => Promise<unknown>
type RouteModuleLoader = () => Promise<unknown>

const routeModuleLoaders: Record<string, RouteModuleLoader> = {
  '/posts': () => import('../pages/PostsPage'),
  '/posts/:slug': () => import('../pages/PostPage'),
  '/chirps': () => import('../pages/ChirpsPage'),
  '/chirps/:slug': () => import('../pages/ChirpPage'),
  '/library': () => import('../pages/LibraryPage'),
}

const routeDataLoaders: Record<string, RouteDataLoader> = {
  '/': () => loadHomePageData(),
  '/posts': () => loadPostsPageData(),
  '/posts/:slug': ({ slug }) => loadPostDetails(slug),
  '/chirps': () => loadChirpsPageData(),
  '/chirps/:slug': ({ slug }) => loadChirpDetails(slug),
  '/library': () => loadLibraryPageData(),
}

export function prefetchRouteModulesAndData(routeHref: string): Promise<void> {
  const normalizedPath = normalizeRoutePath(routeHref)
  const cachedPrefetch = prefetchedRouteResources.get(normalizedPath)
  if (cachedPrefetch) return cachedPrefetch
  const routePattern = Object.keys(routeDataLoaders).find((path) =>
    matchPath({ path, end: true }, normalizedPath)
  )
  if (!routePattern) return Promise.resolve()
  const routeMatch = matchPath({ path: routePattern, end: true }, normalizedPath)
  if (!routeMatch) return Promise.resolve()
  const preloadData = routeDataLoaders[routePattern]
  const preloadModule = routeModuleLoaders[routePattern]
  const prefetchTasks = [
    preloadData(routeMatch.params),
    preloadModule?.(),
  ].filter(Boolean) as Promise<unknown>[]
  const prefetchPromise = Promise.allSettled(prefetchTasks).then((results) => {
    if (results.some((result) => result.status === 'rejected')) prefetchedRouteResources.delete(normalizedPath)
  })
  prefetchedRouteResources.set(normalizedPath, prefetchPromise)
  return prefetchPromise
}
