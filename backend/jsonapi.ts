import type { Request } from 'express'
// @ts-expect-error no types
import { Serializer } from 'jsonapi-serializer'
import { parseFieldsParam } from './fields-param.js'

const JSON_API_CONTENT_TYPE = 'application/vnd.api+json'

const postAttributes = ['name', 'title', 'slug', 'publishedDate', 'html', 'draft', 'tags', 'subheading']
const chirpAttributes = ['name', 'title', 'slug', 'publishedDate', 'html', 'draft', 'tags']
const libraryAttributes = ['name', 'title', 'authors']
const aboutAttributes = ['html']

function serializerOptions(
  resourceType: string,
  attributes: string[],
  req: Request
): { type: string; attributes: string[]; keyForAttribute: string; pluralizeType: boolean } {
  const requestedFields = parseFieldsParam(req, resourceType)
  const attributesToInclude = requestedFields?.length
    ? attributes.filter((a) => requestedFields.includes(a))
    : attributes
  return {
    type: resourceType,
    attributes: attributesToInclude,
    keyForAttribute: 'camelCase',
    pluralizeType: false,
  }
}

export function serializePosts(data: object | object[], req: Request): object {
  return new Serializer('posts', serializerOptions('posts', postAttributes, req)).serialize(data)
}

export function serializeChirps(data: object | object[], req: Request): object {
  return new Serializer('chirps', serializerOptions('chirps', chirpAttributes, req)).serialize(data)
}

export function serializeLibrary(data: object | object[], req: Request): object {
  return new Serializer('library', serializerOptions('library', libraryAttributes, req)).serialize(data)
}

export function serializeAbout(page: { html: string }, req: Request): object {
  const data = { id: 'page', ...page }
  return new Serializer('about', serializerOptions('about', aboutAttributes, req)).serialize(data)
}

const CACHE_CONTROL = 'max-age=60, stale-while-revalidate=31536000'

export function jsonApiResponse(res: { setHeader: (k: string, v: string) => void; json: (body: object) => void }, data: object): void {
  res.setHeader('Content-Type', JSON_API_CONTENT_TYPE)
  res.setHeader('Cache-Control', CACHE_CONTROL)
  res.json(data)
}

export function jsonApiError(
  res: { setHeader: (k: string, v: string) => void; status: (n: number) => { json: (body: object) => void } },
  statusCode: number,
  title: string,
  detail?: string
): void {
  res.setHeader('Content-Type', JSON_API_CONTENT_TYPE)
  res.status(statusCode).json({
    errors: [{ status: String(statusCode), title, ...(detail && { detail }) }],
  })
}
