import { Link, useLoaderData } from 'react-router-dom'
import ChirpsFeed from '../components/ChirpsFeed'
import Tags from '../components/Tags'
import { Chirp, Post } from '../types'
import { contentPath, formatTime, sortBy } from '../utils'

export default function HomePage() {
  const { page, chirps, posts } = useLoaderData() as { page: { html: string }; chirps: Chirp[]; posts: Post[] }
  const recentPosts = sortBy(posts.filter(post => !post.draft), 'publishedDate', 'desc').slice(0, 3)
  return (
    <div className="container mx-auto px-4 mt-4 md:mt-12 pb-24 md:pb-16" style={{ flex: 1 }}>
      <div className="mx-auto max-w-none prose-h1:text-center">
        <div className="prose sm:prose-lg dark:prose-invert relative" style={{ textAlign: 'left', overflowWrap: 'break-word' }}>
          <div dangerouslySetInnerHTML={{ __html: page.html }} />
        </div>
      </div>
      <section className="mx-auto max-w-[720px] mt-14 md:mt-16">
        <h2 className="text-3xl font-light mt-0 mb-6 md:mb-8 text-violet-950 dark:text-violet-300">Latest Posts</h2>
        {recentPosts.map(post => (
          <article key={post.id} className="py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-light mb-2">
              <Link
                className="text-gray-900 dark:text-gray-100 hover:text-brand dark:hover:text-brand-light transition-colors"
                to={contentPath(post)}
              >
                {post.title}
              </Link>
            </h3>
            {post.subheading && (
              <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400 mb-2">
                {post.subheading}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-gray-500 dark:text-gray-400">{formatTime(post.publishedDate)}</p>
              {post.tags && post.tags.length > 0 && (
                <>
                  <span className="text-gray-400 dark:text-gray-500">•</span>
                  <Tags tags={post.tags} />
                </>
              )}
            </div>
          </article>
        ))}
        <div className="mt-5">
          <Link className="text-brand hover:underline" to="/posts">View all posts</Link>
        </div>
      </section>
      <div className="mx-auto max-w-[720px] mt-14 md:mt-16">
        <div className="max-w-[600px]">
          <ChirpsFeed
            chirps={chirps}
            title="Latest Chirps"
            limit={3}
            titleClassName="text-3xl font-light mt-0 mb-6 md:mb-8 text-violet-950 dark:text-violet-300"
          />
        </div>
        <div className="mt-5">
          <Link className="text-brand hover:underline" to="/chirps">View all chirps</Link>
        </div>
      </div>
    </div>
  )
}
