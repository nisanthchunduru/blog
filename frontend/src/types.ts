export interface Entity {
  id: string
  name: string
  slug: string
}
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
export interface Book extends Entity {
  title: string
  authors?: string
}
