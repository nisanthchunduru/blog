import { fetchChirps } from '@/backend/entity-utils'
import { FilesystemCache } from '@/backend/filesystem_cache'
import { sortBy, formatTime } from '@/backend/utils'

const cache = new FilesystemCache()

export const dynamic = 'force-dynamic'

export default async function ChirpsPage() {
  const chirps = await fetchChirps({ cache })
  const sortedChirps = sortBy(chirps.filter(chirp => !chirp.draft), 'publishedDate', 'desc')

  return (
    <div className="container mx-auto px-4" style={{ flex: 1, maxWidth: '600px' }}>
      <h1 className="text-center text-5xl font-bold mt-16 mb-16 text-gray-900 dark:text-gray-100">Chirps</h1>

      <div>
        {sortedChirps.map((chirp) => (
          <article
            key={chirp.id}
            className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 py-4 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex flex-col">
              <time className="text-gray-500 dark:text-gray-400 text-sm mb-2">{formatTime(chirp.publishedDate)}</time>
              <div
                className="text-gray-900 dark:text-gray-100 leading-relaxed prose dark:prose-invert"
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
