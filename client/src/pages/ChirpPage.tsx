import { useLoaderData } from 'react-router-dom'
import { Chirp } from '../types'
import { formatTime } from '../utils'

export default function ChirpPage() {
  const chirp = useLoaderData() as Chirp | null
  if (!chirp) return <div className="container mx-auto mt-8 px-4 max-w-none pb-24 md:pb-0" style={{ flex: 1 }}>Chirp not found</div>
  return (
    <div className="container mx-auto mt-8 px-4 max-w-none pb-24 md:pb-0" style={{ flex: 1 }}>
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
        <div className="prose sm:prose-lg dark:prose-invert" style={{ textAlign: 'justify', overflowWrap: 'break-word' }}>
          <div dangerouslySetInnerHTML={{ __html: chirp.html }} />
        </div>
      </div>
    </div>
  )
}
