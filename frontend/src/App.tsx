import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, redirect } from 'react-router-dom'
import Layout from './components/Layout'
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
  return <Suspense fallback={<div className="flex-1" />}>{children}</Suspense>
}

const router = createBrowserRouter([
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
])

export default function App() {
  return <RouterProvider router={router} />
}
