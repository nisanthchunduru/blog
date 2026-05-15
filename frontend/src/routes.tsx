import { lazy, Suspense } from 'react'
import { redirect, type RouteObject } from 'react-router-dom'
import Layout from './components/Layout'
import RoutePlaceholder from './components/RoutePlaceholder'
import HomePage from './pages/HomePage'
import {
  loadChirpPageData,
  loadChirpsPageData,
  loadHomePageData,
  loadLibraryPageData,
  loadPostPageData,
  loadPostsPageData,
} from './routing/pageDataLoaders'

const PostsPage = lazy(() => import('./pages/PostsPage'))
const PostPage = lazy(() => import('./pages/PostPage'))
const ChirpsPage = lazy(() => import('./pages/ChirpsPage'))
const ChirpPage = lazy(() => import('./pages/ChirpPage'))
const LibraryPage = lazy(() => import('./pages/LibraryPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function LazyRoute({ children }: { children: React.ReactNode }) {
  const currentPathname = typeof window === 'undefined' ? '/' : window.location.pathname
  return <Suspense fallback={<RoutePlaceholder pathname={currentPathname} />}>{children}</Suspense>
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
        loader: loadHomePageData,
      },
      {
        path: 'about',
        loader: () => redirect('/'),
      },
      {
        path: 'posts',
        element: <LazyRoute><PostsPage /></LazyRoute>,
        loader: loadPostsPageData,
      },
      {
        path: 'posts/:slug',
        element: <LazyRoute><PostPage /></LazyRoute>,
        loader: loadPostPageData,
      },
      {
        path: 'chirps',
        element: <LazyRoute><ChirpsPage /></LazyRoute>,
        loader: loadChirpsPageData,
      },
      {
        path: 'chirps/:slug',
        element: <LazyRoute><ChirpPage /></LazyRoute>,
        loader: loadChirpPageData,
      },
      {
        path: 'library',
        element: <LazyRoute><LibraryPage /></LazyRoute>,
        loader: loadLibraryPageData,
      },
      {
        path: '*',
        element: <LazyRoute><NotFoundPage /></LazyRoute>,
      },
    ],
  },
]
