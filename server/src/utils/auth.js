import jwt from 'jsonwebtoken'

const COOKIE_NAME = 'galaxy_access_token'

export function signAccessToken(user) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured')

  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  )
}

export function getAuthToken(req) {
  const authorization = req.headers.authorization
  if (authorization?.startsWith('Bearer ')) return authorization.slice(7)

  const cookieHeader = req.headers.cookie || ''
  const cookie = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))
  return cookie ? decodeURIComponent(cookie.slice(COOKIE_NAME.length + 1)) : null
}

export function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production'
  res.cookieHeader = `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=${isProduction ? 'None' : 'Lax'}${isProduction ? '; Secure' : ''}; Max-Age=604800`
}

export function clearAuthCookie(res) {
  res.cookieHeader = `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}

export function sendWithAuthCookie(res, status, body, token) {
  if (token) setAuthCookie(res, token)
  if (res.cookieHeader) res.setHeader('Set-Cookie', res.cookieHeader)
  return res.status(status).json(body)
}
