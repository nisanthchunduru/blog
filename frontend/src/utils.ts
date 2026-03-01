import { Entity } from './types'

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
    month: 'short',
    day: 'numeric'
  })
}
export function contentPath(entity: Entity): string {
  return `/${entity.name}s/${entity.slug}`
}

function truncateTextWithEllipsis(content: string, maximumLength: number): string {
  if (content.length <= maximumLength) return content
  return `${content.slice(0, maximumLength - 3).trimEnd()}...`
}

export function formatChirpHtml(chirpHtml: string, maximumLinkTextLength = 80): string {
  if (typeof DOMParser === 'undefined') return chirpHtml
  const htmlParser = new DOMParser()
  const chirpDocument = htmlParser.parseFromString(chirpHtml, 'text/html')
  const linkElements = chirpDocument.querySelectorAll('a')
  linkElements.forEach((linkElement) => {
    const fullLinkText = linkElement.textContent?.trim() ?? ''
    if (!fullLinkText) return
    const truncatedLinkText = truncateTextWithEllipsis(fullLinkText, maximumLinkTextLength)
    if (truncatedLinkText !== fullLinkText) {
      linkElement.textContent = truncatedLinkText
      linkElement.title = fullLinkText
    }
  })
  return chirpDocument.body.innerHTML
}
