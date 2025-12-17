import { fetchPosts } from '@/backend/entity-utils'
import { FilesystemCache } from '@/backend/filesystem_cache'
import Link from 'next/link'
import { sortBy, formatTime, contentPath } from '@/backend/utils'

const cache = new FilesystemCache()

export const dynamic = 'force-dynamic'

export default async function PostsPage() {
  const posts = await fetchPosts({ cache })
  const sortedPosts = sortBy(posts.filter(post => !post.draft), 'publishedDate', 'desc')

  return (
    <div className="container mx-auto px-4 max-w-none" style={{ flex: 1 }}>
      <h1 className="text-center text-5xl font-bold mt-16 mb-16 text-gray-900 dark:text-gray-100">Posts</h1>

      <div className="mt-12">
        <div className="text-center">
          {sortedPosts.map((post) => (
            <div key={post.id} className="mt-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                <Link
                  className="text-gray-900 dark:text-gray-100 hover:text-violet-600 dark:hover:text-violet-300 transition-colors"
                  href={contentPath(post)}
                >
                  {post.title}
                </Link>
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
