import dotenv from 'dotenv'
import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import expressEjsLayouts from 'express-ejs-layouts'
import pagesRouter from './routes/pages.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = process.env.LAMBDA_TASK_ROOT || __dirname
const shouldUseFingerprintedAssets = process.env.NODE_ENV === 'production'

function loadAssetsFingerprints(): Record<string, string> {
  if (!shouldUseFingerprintedAssets) return {}

  const fingerprintsPath = path.join(projectRoot, 'public/assets/fingerprints.json')
  return fs.existsSync(fingerprintsPath)
    ? JSON.parse(fs.readFileSync(fingerprintsPath, 'utf8'))
    : {}
}

const assetsFingerprints = loadAssetsFingerprints()

export const getAssetPath = (assetName: string): string => `/assets/${assetsFingerprints[assetName] || assetName}`

export const app = express()

app.locals.assetPath = getAssetPath
app.set('etag', true)
app.set('view engine', 'ejs')
app.set('views', path.join(projectRoot, 'views'))
app.use(expressEjsLayouts)
app.set('layout', 'layouts/application')

app.use(express.static(path.join(projectRoot, 'public')))
app.use(pagesRouter)

app.use((req, res) => {
  res.status(404).render('pages/404', { title: 'Not Found', currentPath: req.path })
})

app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message)
  console.error('Stack:', err.stack)
  if (!res.headersSent) {
    res.status(500).send('Internal server error')
  }
})
