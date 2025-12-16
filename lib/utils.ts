import { format } from 'date-fns'
import { orderBy } from 'lodash'
import * as path from 'path'
import * as fs from 'fs'
import * as crypto from 'crypto'

const staticFolder = path.join(process.cwd(), 'public')
const assetHashes: { [key: string]: string | null } = {}

function computeAssetHash(file: string): string | null {
  if (assetHashes.hasOwnProperty(file)) {
    return assetHashes[file]
  }

  const assetPath = path.join(staticFolder, file)
  
  if (fs.existsSync(assetPath)) {
    const fileBuffer = fs.readFileSync(assetPath)
    const hash = crypto.createHash('md5').update(fileBuffer).digest('hex').substring(0, 10)
    assetHashes[file] = hash
    return hash
  } else {
    assetHashes[file] = null
    return null
  }
}

export function assetUrl(file: string): string {
  const assetHash = computeAssetHash(file) || 'nohash'
  return `/${file}?v=${assetHash}`
}

export function sortBy<T>(entities: T[], key: keyof T, direction: 'asc' | 'desc' = 'desc'): T[] {
  return orderBy(entities, [key], [direction])
}

export function formatTime(timeString: string | null | undefined, formatString: string = '%b %d, %Y'): string {
  if (!timeString) return ''
  const parsedDate = new Date(timeString)
  
  if (isNaN(parsedDate.getTime())) return ''
  
  const formatMap: Record<string, string> = {
    '%b': format(parsedDate, 'MMM'),
    '%d': format(parsedDate, 'dd'),
    '%-d': format(parsedDate, 'd'),
    '%Y': format(parsedDate, 'yyyy'),
    '%y': format(parsedDate, 'yy'),
    '%m': format(parsedDate, 'MM'),
    '%-m': format(parsedDate, 'M'),
    '%B': format(parsedDate, 'MMMM'),
    '%A': format(parsedDate, 'EEEE'),
    '%a': format(parsedDate, 'EEE')
  }
  
  let formattedDateString = formatString
  Object.entries(formatMap).forEach(([placeholder, formattedValue]) => {
    formattedDateString = formattedDateString.replace(placeholder, formattedValue)
  })
  
  return formattedDateString
}

export function contentPath(content: { name: string; slug: string }): string {
  if (!content || !content.name || !content.slug) {
    return ''
  }
  if (content.name === content.slug) {
    return `/${content.slug}`
  }
  return `/${content.name}s/${content.slug}`
}

export function urlEncode(str: string): string {
  if (!str) return ''
  return encodeURIComponent(str)
}
