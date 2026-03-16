import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import GoogleFonts from './GoogleFonts'
import Header from './Header'
import Footer from './Footer'
import TopLoadingBar from './TopLoadingBar'

export default function Layout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <>
      <Helmet>
        <title>Nisanth Chunduru</title>
        <meta name="description" content="Nisanth Chunduru's Blog" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="google-site-verification" content="CIGnBZCqH2WX_UMtk5WQP3UJg6UIk_2HNNlBAnLFatA" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </Helmet>
      <GoogleFonts />
      <div className="flex flex-col dark:bg-brand-dark" style={{ minHeight: '100vh' }}>
        <TopLoadingBar />
        <Header />
        <Outlet />
        <Footer className="md:hidden" />
      </div>
    </>
  )
}
