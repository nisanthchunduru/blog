import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { app } from './app'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3001

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
  })
}

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
