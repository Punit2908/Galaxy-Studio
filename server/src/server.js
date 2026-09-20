import 'dotenv/config'
import app from './app.js'
import connectDB from './config/db.js'
import bootstrapSuperAdmin from './services/bootstrapSuperAdmin.js'

const PORT = process.env.PORT || 5000

await connectDB()
if (process.env.MONGO_URI) await bootstrapSuperAdmin()

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})
