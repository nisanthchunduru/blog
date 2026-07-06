import type { Request, Response } from 'express'
import { app } from '../app.js'

export function run(request: Request, response: Response): void {
  app(request, response)
}
