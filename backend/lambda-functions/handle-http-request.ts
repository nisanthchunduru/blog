import serverlessExpress from '@vendia/serverless-express'
import { app } from '../app.js'

export const run = serverlessExpress({ app })
