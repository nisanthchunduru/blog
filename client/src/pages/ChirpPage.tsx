import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Chirp } from '../types'
import { formatTime } from '../utils'

export default function ChirpPage() {
  const { slug } = useParams()
  const [chirp, setChirp] = useState<Chirp | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch(`/api/chirps/${slug}`)
      .then(res => res.json())
      .then(setChirp)
      .finally(() => setLoading(false))
  }, [slug])
  if (loading) return <div className="container mx-auto mt-8 px-4 max-w-none" style={{ flex: 1 }}>Loading...</div>
  if (!chirp) return <div className="container mx-auto mt-8 px-4 max-w-none" style={{ flex: 1 }}>Chirp not found</div>
  return (
    <div className="container mx-auto mt-8 px-4 max-w-none" style={{ flex: 1 }}>
      <div className="article mt-6">
        <h1 className="text-center text-4xl font-bold mb-3 text-gray-900 dark:text-gray-100">{chirp.title}</h1>
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <p className="text-gray-500 dark:text-gray-400">{formatTime(chirp.publishedDate)}</p>
          {chirp.tags && chirp.tags.length > 0 && (
            <>
              <span className="text-gray-400 dark:text-gray-500">•</span>
              <div className="flex flex-wrap gap-2">
                {chirp.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="prose prose-lg dark:prose-invert" style={{ textAlign: 'justify', overflowWrap: 'break-word' }}>
          <div dangerouslySetInnerHTML={{ __html: chirp.html }} />
        </div>
      </div>
    </div>
  )
}
