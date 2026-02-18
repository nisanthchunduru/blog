import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import Header from './Header'
import Footer from './Footer'
import MobileNav from './MobileNav'
import TopLoadingBar from './TopLoadingBar'

export default function Layout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const theme = stored || (prefersDark ? 'dark' : 'light')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js'
    script.onload = () => {
      (window as any).hljs?.highlightAll()
    }
    document.body.appendChild(script)
    const darkModeScript = document.createElement('script')
    darkModeScript.src = '/js/dark-mode.js'
    document.body.appendChild(darkModeScript)
    return () => {
      document.body.removeChild(script)
      document.body.removeChild(darkModeScript)
    }
  }, [])
  return (
    <>
      <Helmet>
        <title>Nisanth Chunduru</title>
        <meta name="description" content="Nisanth Chunduru's Blog" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="google-site-verification" content="CIGnBZCqH2WX_UMtk5WQP3UJg6UIk_2HNNlBAnLFatA" />
        <link rel="icon" href="/images/square-profile-photo.jpg" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/amazon-fonts@1.0.1/fonts/stylesheet.css" />
        <link rel="stylesheet" href="https://cdn.statically.io/gh/nisanthchunduru/fonts/master/fonts.css" />
        <link id="hljs-light" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css" />
        <link id="hljs-dark" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css" media="none" />
      </Helmet>
      <div className="flex flex-col bg-white dark:bg-gray-900" style={{ minHeight: '100vh' }}>
        <TopLoadingBar />
        <Header />
        <Outlet />
        <Footer />
        <MobileNav />
      </div>
    </>
  )
}
