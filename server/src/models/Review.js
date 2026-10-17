import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
  text: { type: String, required: true, trim: true, minlength: 3, maxlength: 2000 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
}, { timestamps: true })

export default mongoose.model('Review', reviewSchema)
