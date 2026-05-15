export interface Entity {
  id: string
  name: string
  slug: string
}
export type PostListItem = Pick<Post, 'id' | 'name' | 'title' | 'slug' | 'publishedDate' | 'subheading' | 'tags' | 'draft'>
export interface Post extends Entity {
  title: string
  html: string
  publishedDate: string
  draft?: boolean
  tags?: string[]
  subheading?: string
}
export interface Chirp extends Entity {
  title: string
  html: string
  publishedDate: string
  draft?: boolean
  tags?: string[]
}
export type BookListItem = Pick<Book, 'id' | 'title' | 'authors'>
export interface Book extends Entity {
  title: string
  authors?: string
}
