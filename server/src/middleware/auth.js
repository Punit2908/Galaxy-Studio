import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { getAuthToken } from '../utils/auth.js'

export async function requireAuth(req, res, next) {
  try {
    const token = getAuthToken(req)
    if (!token) return res.status(401).json({ message: 'Authentication required.' })

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.sub)
    if (!user) return res.status(401).json({ message: 'User account not found.' })

    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' })
  }
}

export function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ message: 'Super admin access required.' })
  }
  next()
}
