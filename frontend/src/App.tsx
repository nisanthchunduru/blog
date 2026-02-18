import { createBrowserRouter, RouterProvider, redirect } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import PostsPage from './pages/PostsPage'
import PostPage from './pages/PostPage'
import ChirpsPage from './pages/ChirpsPage'
import ChirpPage from './pages/ChirpPage'
import LibraryPage from './pages/LibraryPage'
import NotFoundPage from './pages/NotFoundPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
        loader: () => fetch('/api/about').then(res => res.json()),
      },
      {
        path: 'about',
        loader: () => redirect('/'),
      },
      {
        path: 'posts',
        element: <PostsPage />,
        loader: () => fetch('/api/posts').then(res => res.json()),
      },
      {
        path: 'posts/:slug',
        element: <PostPage />,
        loader: ({ params }) => fetch(`/api/posts/${params.slug}`).then(res => res.json()),
      },
      {
        path: 'chirps',
        element: <ChirpsPage />,
        loader: () => fetch('/api/chirps').then(res => res.json()),
      },
      {
        path: 'chirps/:slug',
        element: <ChirpPage />,
        loader: ({ params }) => fetch(`/api/chirps/${params.slug}`).then(res => res.json()),
      },
      {
        path: 'library',
        element: <LibraryPage />,
        loader: () => fetch('/api/library').then(res => res.json()),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
