import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const [pageHtml, setPageHtml] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/about')
      .then(res => res.json())
      .then(page => setPageHtml(page.html))
      .finally(() => setLoading(false))
  }, [])
  if (loading) return <div className="container mx-auto px-4 max-w-none" style={{ flex: 1 }}>Loading...</div>
  return (
    <div className="container mx-auto px-4 max-w-none prose-h1:text-center sm:mt-12" style={{ flex: 1 }}>
      <div className="[&_h1:first-child]:mb-16 prose sm:prose-lg dark:prose-invert relative" style={{ textAlign: 'left', overflowWrap: 'break-word' }}>
        <Link to="/" className="block sm:hidden mb-8">
          <img
            src="/images/square-profile-photo.jpg"
            alt="Nisanth Chunduru"
            className="w-24 h-24 rounded-full mx-auto"
          />
        </Link>
        <Link to="/" className="hidden sm:block float-right ml-4 mb-6">
          <img
            src="/images/square-profile-photo.jpg"
            alt="Nisanth Chunduru"
            className="w-32 h-32 rounded-full"
          />
        </Link>
        <div dangerouslySetInnerHTML={{ __html: pageHtml }} />
      </div>
    </div>
  )
}
