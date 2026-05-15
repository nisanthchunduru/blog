import React from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from './contexts/ThemeContext'
import { routes } from './routes'
import './index.css'

declare global {
  interface Window {
    __SSR__?: boolean
    __SSR_DATA__?: unknown
  }
}

const router = createBrowserRouter(routes, {
  future: {
    v7_partialHydration: true,
  },
})

const app = (
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
)

const rootElement = document.getElementById('root')!

if (window.__SSR__) {
  hydrateRoot(rootElement, app)
} else {
  createRoot(rootElement).render(app)
}
