import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Post } from '../types'
import { formatTime } from '../utils'

export default function PostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch(`/api/posts/${slug}`)
      .then(res => res.json())
      .then(setPost)
      .finally(() => setLoading(false))
  }, [slug])
  if (loading) return <div className="container mx-auto mt-8 px-4 max-w-none" style={{ flex: 1 }}>Loading...</div>
  if (!post) return <div className="container mx-auto mt-8 px-4 max-w-none" style={{ flex: 1 }}>Post not found</div>
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
