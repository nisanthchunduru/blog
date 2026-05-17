import { app } from './app.js'

const PORT = process.env.PORT || 3001

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
