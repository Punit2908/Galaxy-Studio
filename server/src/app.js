import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import apiRoutes from './routes/index.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
}))

app.use('/api', apiRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'galaxy-studio-api' })
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(400).json({ message: err.message || 'Request failed.' })
})

export default app
