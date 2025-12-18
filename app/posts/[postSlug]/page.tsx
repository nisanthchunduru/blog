import { fetchPostsFromCache } from '@/backend/entity-utils'
import { FilesystemCache } from '@/backend/filesystem_cache'
import { notFound } from 'next/navigation'
import { formatTime } from '@/backend/utils'

const cache = new FilesystemCache()

export const dynamic = 'force-dynamic'

function extractShortIdFromSlug(slug: string): string {
  return slug.split('-')[0]
}

function findEntityBySlug<T extends { id: string }>(entities: T[], slug: string): T | undefined {
  const shortId = extractShortIdFromSlug(slug)
  return entities.find(entity => entity.id.replace(/-/g, '').substring(0, 8) === shortId)
}

export default async function PostPage({ params }: { params: { postSlug: string } }) {
  const posts = await fetchPostsFromCache(cache)
  const post = findEntityBySlug(posts, params.postSlug)

  if (!post) {
    notFound()
  }

  return (
    <div className="container mx-auto mt-8 px-4 max-w-none" style={{ flex: 1 }}>
      <div className="article mt-6">
        <h1 className="text-center text-4xl font-bold mb-3 text-gray-900 dark:text-gray-100">{post.title}</h1>
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <p className="text-gray-500 dark:text-gray-400">{formatTime(post.publishedDate)}</p>
          {post.tags && post.tags.length > 0 && (
            <>
              <span className="text-gray-400 dark:text-gray-500">•</span>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
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
          <div dangerouslySetInnerHTML={{ __html: post.html }} />
        </div>
      </div>
    </div>
  )
}
