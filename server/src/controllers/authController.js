import User from '../models/User.js'
import { sendWithAuthCookie, clearAuthCookie, signAccessToken } from '../utils/auth.js'

function validateCredentials(name, email, password, requireName = false) {
  if (requireName && (!name || name.trim().length < 2)) return 'Name must contain at least 2 characters.'
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address.'
  if (!password || password.length < 8) return 'Password must be at least 8 characters.'
  return null
}

export async function register(req, res) {
  const { name, email, password } = req.body
  const validationError = validateCredentials(name, email, password, true)
  if (validationError) return res.status(400).json({ message: validationError })

  const normalizedEmail = email.toLowerCase().trim()
  const existing = await User.findOne({ email: normalizedEmail })
  if (existing) return res.status(409).json({ message: 'An account with this email already exists.' })

  const user = await User.create({ name: name.trim(), email: normalizedEmail, password, role: 'user' })
  const token = signAccessToken(user)
  return sendWithAuthCookie(res, 201, { user: user.toSafeJSON() }, token)
}

export async function login(req, res) {
  const { email, password } = req.body
  const validationError = validateCredentials('', email, password)
  if (validationError) return res.status(400).json({ message: validationError })

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password.' })
  }

  const token = signAccessToken(user)
  return sendWithAuthCookie(res, 200, { user: user.toSafeJSON() }, token)
}

export async function logout(_req, res) {
  clearAuthCookie(res)
  res.setHeader('Set-Cookie', res.cookieHeader)
  return res.status(200).json({ message: 'Logged out successfully.' })
}

export async function me(req, res) {
  return res.json({ user: req.user.toSafeJSON() })
}
