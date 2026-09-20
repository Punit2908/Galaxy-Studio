import User from '../models/User.js'

export default async function bootstrapSuperAdmin() {
  const { SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, SUPER_ADMIN_NAME = 'Galaxy Studio Admin' } = process.env
  if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
    console.warn('Super admin bootstrap skipped. Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD.')
    return
  }

  const email = SUPER_ADMIN_EMAIL.toLowerCase().trim()
  const existing = await User.findOne({ email }).select('+password')
  if (existing) {
    if (existing.role !== 'superadmin') {
      existing.role = 'superadmin'
      await existing.save()
    }
    return
  }

  await User.create({
    name: SUPER_ADMIN_NAME,
    email,
    password: SUPER_ADMIN_PASSWORD,
    role: 'superadmin',
  })
  console.log(`Super admin created: ${email}`)
}
