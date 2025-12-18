import { fetchNotionPageFromByNameFromCache } from '@/backend/notion_utils'
import { FilesystemCache } from '@/backend/filesystem_cache'
import Image from 'next/image'
import Link from 'next/link'

const cache = new FilesystemCache()

export const dynamic = 'force-dynamic'

export default async function Home() {
  const page = await fetchNotionPageFromByNameFromCache('about', cache)

  return (
    <div className="container mx-auto px-4 max-w-none prose-h1:text-center sm:mt-12" style={{ flex: 1 }}>
      <div className="[&_h1:first-child]:mb-16 prose sm:prose-lg dark:prose-invert relative" style={{ textAlign: 'left', overflowWrap: 'break-word' }}>
        <Link href="/" className="block sm:hidden mb-8">
          <Image
            src="/images/square-profile-photo.jpg"
            alt="Nisanth Chunduru"
            width={96}
            height={96}
            className="w-24 h-24 rounded-full mx-auto"
          />
        </Link>
        <Link href="/" className="hidden sm:block float-right ml-4 mb-6">
          <Image
            src="/images/square-profile-photo.jpg"
            alt="Nisanth Chunduru"
            width={128}
            height={128}
            className="w-32 h-32 rounded-full"
          />
        </Link>
        <div dangerouslySetInnerHTML={{ __html: page.html }} />
      </div>
    </div>
  )
}
