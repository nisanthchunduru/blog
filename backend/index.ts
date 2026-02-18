import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import aboutRouter from './routes/about'
import chirpsRouter from './routes/chirps'
import libraryRouter from './routes/library'
import postsRouter from './routes/posts'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/about', aboutRouter)
app.use('/api/posts', postsRouter)
app.use('/api/chirps', chirpsRouter)
app.use('/api/library', libraryRouter)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
  })
}

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err.message)
  console.error('Stack:', err.stack)
  console.error('Request URL:', req.url)
  
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err.message)
  console.error('Stack:', err.stack)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise)
  console.error('Reason:', reason)
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
