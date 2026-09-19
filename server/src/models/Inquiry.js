import mongoose from 'mongoose'

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: String,
    weddingDate: Date,
    location: String,
    services: [String],
    message: String,
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed'],
      default: 'new',
    },
  },
  { timestamps: true },
)

export default mongoose.model('Inquiry', inquirySchema)
