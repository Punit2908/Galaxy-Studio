import { supabase } from '../config/supabase.js'
import { getAuthToken } from '../utils/auth.js'

export async function requireAuth(req, res, next) {
  try {
    if (!supabase) return res.status(503).json({ message: 'Supabase is not configured.' })
    const token = getAuthToken(req)
    if (!token) return res.status(401).json({ message: 'Authentication required.' })

    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) return res.status(401).json({ message: 'Invalid or expired authentication token.' })

    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('id,name,email,role,created_at').eq('id', data.user.id).maybeSingle()
    if (profileError) throw profileError

    req.authUser = data.user
    req.user = profile || {
      id:data.user.id, name:data.user.user_metadata?.name || '', email:data.user.email,
      role:'user', created_at:data.user.created_at,
    }
    next()
  } catch (error) {
    console.error('Auth middleware:', error)
    return res.status(401).json({ message: 'Authentication could not be verified.' })
  }
}

export function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== 'superadmin') return res.status(403).json({ message: 'Super admin access required.' })
  next()
}
