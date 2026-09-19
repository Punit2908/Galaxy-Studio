import mongoose from 'mongoose'

export default async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.warn('MONGO_URI is not set. Database connection skipped.')
    return
  }

  await mongoose.connect(process.env.MONGO_URI)
  console.log('MongoDB connected')
}
