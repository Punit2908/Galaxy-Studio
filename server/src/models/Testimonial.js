import mongoose from 'mongoose'

const testimonialSchema = new mongoose.Schema(
  {
    coupleName: { type: String, required: true },
    text: { type: String, required: true },
    photo: String,
    wedding: { type: mongoose.Schema.Types.ObjectId, ref: 'Wedding' },
  },
  { timestamps: true },
)

export default mongoose.model('Testimonial', testimonialSchema)
