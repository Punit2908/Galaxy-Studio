import mongoose from 'mongoose'

const weddingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    couple: { type: String, trim: true },
    location: { type: String, trim: true },
    date: Date,
    description: String,
    coverImage: String,
    photos: [String],
    videos: [String],
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export default mongoose.model('Wedding', weddingSchema)
