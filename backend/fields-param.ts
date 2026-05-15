import type { Request } from 'express'

export function parseFieldsParam(req: Request, resourceType: string): string[] | null {
  const fieldsParam = req.query[`fields[${resourceType}]`]
  if (typeof fieldsParam !== 'string') return null
  return fieldsParam.split(',').map(f => f.trim()).filter(Boolean)
}
