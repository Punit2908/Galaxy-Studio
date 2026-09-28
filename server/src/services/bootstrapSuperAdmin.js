import { supabase } from '../config/supabase.js'

export default async function bootstrapSuperAdmin() {
  if (!supabase) return
  const { SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, SUPER_ADMIN_NAME='Galaxy Photography Admin' } = process.env
  if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
    console.warn('Super admin bootstrap skipped. Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD.')
    return
  }

  const email = SUPER_ADMIN_EMAIL.toLowerCase().trim()
  const { data: users, error:listError } = await supabase.auth.admin.listUsers({ page:1, perPage:1000 })
  if (listError) throw listError

  let authUser = users.users.find((user) => user.email?.toLowerCase() === email)
  if (!authUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email, password:SUPER_ADMIN_PASSWORD, email_confirm:true,
      user_metadata:{ name:SUPER_ADMIN_NAME },
    })
    if (error) throw error
    authUser=data.user
    console.log(`Super admin created: ${email}`)
  }

  const { error } = await supabase.from('profiles').upsert({
    id:authUser.id, name:SUPER_ADMIN_NAME, email, role:'superadmin',
  }, { onConflict:'id' })
  if (error) throw error
}
