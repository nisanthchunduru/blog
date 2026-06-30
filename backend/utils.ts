import { Entity, Slugable } from './entity.js'

export function sortBy<T extends Record<string, any>>(
  items: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal === bVal) return 0
    
    const comparison = aVal < bVal ? -1 : 1
    return order === 'asc' ? comparison : -comparison
  })
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function contentPath(entity: Entity & Slugable): string {
  return `/${entity.name}s/${entity.slug}`
}

export function getReadingTime(html: string): string {
  const wordsPerMinute = 200
  const cleanText = html.replace(/<[^>]*>/g, '')
  const wordCount = cleanText.trim().split(/\s+/).filter(Boolean).length
  const readingTime = Math.ceil(wordCount / wordsPerMinute)
  return `${readingTime} min read`
}
