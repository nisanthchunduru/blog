import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, redirect } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'

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
        loader: async () => {
          const [page, chirps, posts] = await Promise.all([
            fetch('/api/about').then(res => res.json()),
            fetch('/api/chirps').then(res => res.json()),
            fetch('/api/posts').then(res => res.json()),
          ])
          return { page, chirps, posts }
        },
      },
      {
        path: 'about',
        loader: () => redirect('/'),
      },
      {
        path: 'posts',
        element: <LazyRoute><PostsPage /></LazyRoute>,
        loader: () => fetch('/api/posts').then(res => res.json()),
      },
      {
        path: 'posts/:slug',
        element: <LazyRoute><PostPage /></LazyRoute>,
        loader: ({ params }) => fetch(`/api/posts/${params.slug}`).then(res => res.json()),
      },
      {
        path: 'chirps',
        element: <LazyRoute><ChirpsPage /></LazyRoute>,
        loader: () => fetch('/api/chirps').then(res => res.json()),
      },
      {
        path: 'chirps/:slug',
        element: <LazyRoute><ChirpPage /></LazyRoute>,
        loader: ({ params }) => fetch(`/api/chirps/${params.slug}`).then(res => res.json()),
      },
      {
        path: 'library',
        element: <LazyRoute><LibraryPage /></LazyRoute>,
        loader: () => fetch('/api/library').then(res => res.json()),
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
