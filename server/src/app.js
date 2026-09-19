import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
}))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'wedding-studio-api' })
})

export default app
