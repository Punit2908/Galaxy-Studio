import { supabase } from '../config/supabase.js'
import { clearAuthCookie, setAuthCookie } from '../utils/auth.js'

function validate(name, email, password, requireName = false) {
  if (requireName && (!name || name.trim().length < 2)) return 'Name must contain at least 2 characters.'
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address.'
  if (!password || password.length < 8) return 'Password must be at least 8 characters.'
  return null
}

function safeUser(authUser, profile) {
  return {
    id: authUser.id,
    name: profile?.name || authUser.user_metadata?.name || '',
    email: authUser.email,
    role: profile?.role || 'user',
    createdAt: profile?.created_at || authUser.created_at,
  }
}

export async function register(req, res) {
  const { name, email, password } = req.body
  const validationError = validate(name, email, password, true)
  if (validationError) return res.status(400).json({ message: validationError })
  if (!supabase) return res.status(503).json({ message: 'Supabase is not configured.' })

  const normalizedEmail = email.toLowerCase().trim()
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: { name: name.trim() },
  })
  if (createError) {
    return res.status(/already|exists|duplicate/i.test(createError.message) ? 409 : 400).json({ message: createError.message })
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: created.user.id, name: name.trim(), email: normalizedEmail, role: 'user',
  })
  if (profileError) {
    await supabase.auth.admin.deleteUser(created.user.id)
    throw profileError
  }

  const { data: session, error: loginError } = await supabase.auth.signInWithPassword({
    email: normalizedEmail, password,
  })
  if (loginError || !session.session) throw loginError || new Error('Unable to create a session.')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', created.user.id).single()
  setAuthCookie(res, session.session.access_token)
  return res.status(201).json({ user: safeUser(created.user, profile) })
}

export async function login(req, res) {
  const { email, password } = req.body
  const validationError = validate('', email, password)
  if (validationError) return res.status(400).json({ message: validationError })
  if (!supabase) return res.status(503).json({ message: 'Supabase is not configured.' })

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(), password,
  })
  if (error || !data.session) return res.status(401).json({ message: 'Invalid email or password.' })

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle()
  setAuthCookie(res, data.session.access_token)
  return res.json({ user: safeUser(data.user, profile) })
}

export function logout(_req, res) {
  clearAuthCookie(res)
  return res.json({ message: 'Logged out successfully.' })
}

export async function me(req, res) {
  return res.json({
    user: { id:req.user.id, name:req.user.name, email:req.user.email, role:req.user.role, createdAt:req.user.created_at },
  })
}
