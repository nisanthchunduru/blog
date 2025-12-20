import { useEffect, useState } from 'react'
import { Chirp } from '../types'
import { sortBy, formatTime } from '../utils'

export default function ChirpsPage() {
  const [chirps, setChirps] = useState<Chirp[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/chirps')
      .then(res => res.json())
      .then((data: Chirp[]) => {
        const sortedChirps = sortBy(data.filter(chirp => !chirp.draft), 'publishedDate', 'desc')
        setChirps(sortedChirps)
      })
      .finally(() => setLoading(false))
  }, [])
  if (loading) return null
  return (
    <div className="container mx-auto px-4 pb-24 md:pb-0" style={{ flex: 1, maxWidth: '600px' }}>
      <h1 className="text-center text-5xl font-bold mt-8 md:mt-16 mb-16 text-gray-900 dark:text-gray-100">Chirps</h1>
      <div>
        {chirps.map((chirp) => (
          <article
            key={chirp.id}
            className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 py-4 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex flex-col">
              <time className="text-gray-500 dark:text-gray-400 text-sm mb-2">{formatTime(chirp.publishedDate)}</time>
              <div
                className="text-gray-900 dark:text-gray-100 leading-relaxed"
                style={{ wordWrap: 'break-word', lineHeight: 1.6 }}
              >
                <div dangerouslySetInnerHTML={{ __html: chirp.html }} />
              </div>
              {chirp.tags && chirp.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {chirp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
