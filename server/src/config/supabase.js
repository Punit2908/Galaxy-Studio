import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.warn('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
}

export const supabase = url && key
  ? createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'galaxy-media'
