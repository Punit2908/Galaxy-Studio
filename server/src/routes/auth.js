import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { login, logout, me, register } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
const authLimiter = rateLimit({ windowMs: 15 * 15 * 1000, max: 20, standardHeaders: 'draft-8', legacyHeaders: false })

router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.post('/logout', logout)
router.get('/me', requireAuth, me)

export default router
