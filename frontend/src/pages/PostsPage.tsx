import { Link, useLoaderData } from 'react-router-dom'
import { Post } from '../types'
import { sortBy, formatTime, contentPath } from '../utils'

function postsByYear(posts: Post[]): [number, Post[]][] {
  const grouped = new Map<number, Post[]>()
  for (const post of posts) {
    const year = new Date(post.publishedDate).getFullYear()
    const existing = grouped.get(year) ?? []
    grouped.set(year, [...existing, post])
  }
  return [...grouped.entries()].sort(([a], [b]) => b - a)
}

export default function PostsPage() {
  const data = useLoaderData() as Post[]
  const posts = sortBy(data.filter(post => !post.draft), 'publishedDate', 'desc')
  const yearGroups = postsByYear(posts)
  return (
    <div className="container mx-auto px-4 max-w-none pb-24 md:pb-0" style={{ flex: 1 }}>
      <h1 className="text-center text-5xl font-bold mt-8 md:mt-16 mb-16 text-gray-900 dark:text-gray-100">Posts</h1>
      <div className="mt-12">
        <div className="text-center">
          {yearGroups.map(([year, yearPosts]) => (
            <div key={year} className="mb-16">
              <h2 className="text-4xl font-bold mb-8 text-gray-400 dark:text-gray-600">{year}</h2>
              {yearPosts.map((post) => (
                <div key={post.id} className="mt-10">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                    <Link
                      className="text-gray-900 dark:text-gray-100 hover:text-brand dark:hover:text-brand-light transition-colors"
                      to={contentPath(post)}
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                    <p className="text-brand">{formatTime(post.publishedDate)}</p>
                    {post.tags && post.tags.length > 0 && (
                      <>
                        <span className="text-gray-400 dark:text-gray-500">•</span>
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand"
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
          ))}
        </div>
      </div>
    </div>
  )
}
