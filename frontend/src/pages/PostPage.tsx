import { useLoaderData } from 'react-router-dom'
import { Post } from '../types'
import { formatTime } from '../utils'
import Tags from '../components/Tags'

export default function PostPage() {
  const post = useLoaderData() as Post | null
  if (!post) return <div className="container mx-auto mt-8 px-4 max-w-none pb-24 md:pb-0" style={{ flex: 1 }}>Post not found</div>
  return (
    <div className="container mx-auto mt-8 px-4 max-w-none pb-24 md:pb-0" style={{ flex: 1 }}>
      <div className="article mt-6">
        <h1 className="text-center text-4xl font-bold mb-3 text-gray-900 dark:text-gray-100">{post.title}</h1>
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <p className="text-gray-500 dark:text-gray-400">{formatTime(post.publishedDate)}</p>
          {post.tags && post.tags.length > 0 && (
            <>
              <span className="text-gray-400 dark:text-gray-500">•</span>
              <Tags tags={post.tags} />
            </>
          )}
        </div>
        <div className="prose sm:prose-lg dark:prose-invert" style={{ textAlign: 'justify', overflowWrap: 'break-word' }}>
          <div dangerouslySetInnerHTML={{ __html: post.html }} />
        </div>
      </div>
    </div>
  )
}
