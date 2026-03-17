import ChirpRoutePlaceholder from './RoutePlaceholders/ChirpRoutePlaceholder'
import ChirpsRoutePlaceholder from './RoutePlaceholders/ChirpsRoutePlaceholder'
import HomeRoutePlaceholder from './RoutePlaceholders/HomeRoutePlaceholder'
import LibraryRoutePlaceholder from './RoutePlaceholders/LibraryRoutePlaceholder'
import PostRoutePlaceholder from './RoutePlaceholders/PostRoutePlaceholder'
import PostsRoutePlaceholder from './RoutePlaceholders/PostsRoutePlaceholder'

type RoutePlaceholderProps = {
  pathname: string
}

export default function RoutePlaceholder({ pathname }: RoutePlaceholderProps) {
  if (pathname.startsWith('/posts/')) return <PostRoutePlaceholder />
  if (pathname === '/posts') return <PostsRoutePlaceholder />
  if (pathname.startsWith('/chirps/')) return <ChirpRoutePlaceholder />
  if (pathname === '/chirps') return <ChirpsRoutePlaceholder />
  if (pathname === '/library') return <LibraryRoutePlaceholder />
  return <HomeRoutePlaceholder />
}
