import { useLoaderData } from 'react-router-dom'
import { Chirp } from '../types'
import { sortBy, formatTime } from '../utils'
import Tags from '../components/Tags'

export default function ChirpsPage() {
  const data = useLoaderData() as Chirp[]
  const chirps = sortBy(data.filter(chirp => !chirp.draft), 'publishedDate', 'desc')
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
              <time className="text-brand text-sm mb-2">{formatTime(chirp.publishedDate)}</time>
              <div
                className="text-gray-900 dark:text-gray-100 leading-relaxed"
                style={{ wordWrap: 'break-word', lineHeight: 1.6 }}
              >
                <div dangerouslySetInnerHTML={{ __html: chirp.html }} />
              </div>
              {chirp.tags && chirp.tags.length > 0 && (
                <div className="mt-3">
                  <Tags tags={chirp.tags} />
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
