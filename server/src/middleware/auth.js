import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { getAuthToken } from '../utils/auth.js'

export async function requireAuth(req, res, next) {
  try {
    const token = getAuthToken(req)
    if (!token) return res.status(401).json({ message: 'Authentication required.' })
    if (!process.env.JWT_SECRET) return res.status(503).json({ message: 'JWT_SECRET is not configured.' })

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.sub)
    if (!user) return res.status(401).json({ message: 'Account no longer exists.' })

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' })
  }
}

export function requireSuperAdmin(req, res, next) {
  if (!['superadmin', 'admin'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Admin access required.' })
  }
  next()
}
