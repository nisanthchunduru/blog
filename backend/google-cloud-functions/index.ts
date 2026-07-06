import type { Request, Response } from 'express'
import { run as handleHttpRequest } from './handle-http-request.js'
import { run as sync } from './sync.js'

const handlerByFunctionName: Record<string, (request: Request, response: Response) => void | Promise<void>> = {
  'blog-handle-http-request': handleHttpRequest,
  'blog-sync': sync,
}

export function run(request: Request, response: Response): void | Promise<void> {
  const functionName = process.env.BLOG_GOOGLE_CLOUD_FUNCTION || process.env.K_SERVICE
  const handler = functionName ? handlerByFunctionName[functionName] : null
  if (!handler) {
    response.status(500).send(`Unknown function: ${functionName ?? 'unset'}`)
    return
  }
  return handler(request, response)
}
