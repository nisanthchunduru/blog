type JsonApiResource = {
  type: string
  id: string
  attributes?: Record<string, unknown>
}

type JsonApiDocument = {
  data: JsonApiResource | JsonApiResource[] | null
  errors?: Array<{ status?: string; title?: string; detail?: string }>
}

function typeToEntityName(type: string): string {
  if (type === 'library' || type === 'about') return type
  return type.slice(0, -1)
}

function resourceToEntity(resource: JsonApiResource): Record<string, unknown> {
  const name = typeToEntityName(resource.type)
  return {
    id: resource.id,
    name,
    ...resource.attributes,
  }
}

export function parseJsonApiDocument<T>(document: JsonApiDocument): T | T[] | null {
  if (document.errors?.length) {
    throw new Error(document.errors[0].detail ?? document.errors[0].title ?? 'API error')
  }
  const { data } = document
  if (data === null) return null
  if (Array.isArray(data)) return data.map(resourceToEntity) as T[]
  return resourceToEntity(data) as T
}
