import User from '../models/User.js'

export default async function bootstrapSuperAdmin() {
  const { SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, SUPER_ADMIN_NAME = 'Galaxy Photography Admin' } = process.env

  if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
    console.warn('Super admin bootstrap skipped. Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD.')
    return
  }

  const email = SUPER_ADMIN_EMAIL.toLowerCase().trim()
  let user = await User.findOne({ email }).select('+password')

  if (!user) {
    user = await User.create({
      name: SUPER_ADMIN_NAME,
      email,
      password: SUPER_ADMIN_PASSWORD,
      role: 'superadmin',
    })
    console.log(`Super admin created in MongoDB: ${email}`)
    return
  }

  user.name = SUPER_ADMIN_NAME
  user.role = 'superadmin'
  if (!(await user.comparePassword(SUPER_ADMIN_PASSWORD))) {
    user.password = SUPER_ADMIN_PASSWORD
  }
  await user.save()
  console.log(`Super admin ready in MongoDB: ${email}`)
}
