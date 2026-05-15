import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RoutePlaceholder from './components/RoutePlaceholder'
import { routes } from './routes'

const router = createBrowserRouter(routes)

export default function App() {
  const currentPathname = typeof window === 'undefined' ? '/' : window.location.pathname
  return <RouterProvider router={router} fallbackElement={<RoutePlaceholder pathname={currentPathname} />} />
}
