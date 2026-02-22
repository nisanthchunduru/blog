import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import aboutRouter from './routes/about.js'
import chirpsRouter from './routes/chirps.js'
import libraryRouter from './routes/library.js'
import postsRouter from './routes/posts.js'

dotenv.config()

export const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/about', aboutRouter)
app.use('/api/posts', postsRouter)
app.use('/api/chirps', chirpsRouter)
app.use('/api/library', libraryRouter)

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err.message)
  console.error('Stack:', err.stack)
  console.error('Request URL:', req.url)
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' })
  }
})
