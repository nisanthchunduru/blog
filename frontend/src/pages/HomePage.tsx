import { useLoaderData } from 'react-router-dom'

export default function HomePage() {
  const page = useLoaderData() as { html: string }
  return (
    <div className="container mx-auto px-4 max-w-none prose-h1:text-center mt-4 md:mt-12 pb-24 md:pb-0" style={{ flex: 1 }}>
      <div className="prose sm:prose-lg dark:prose-invert relative" style={{ textAlign: 'left', overflowWrap: 'break-word' }}>
        <div dangerouslySetInnerHTML={{ __html: page.html }} />
      </div>
    </div>
  )
}
