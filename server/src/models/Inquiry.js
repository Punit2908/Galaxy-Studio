import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, default: '', trim: true, maxlength: 30 },
  service: { type: String, default: '', trim: true, maxlength: 120 },
  message: { type: String, required: true, maxlength: 3000 },
  status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new', index: true },
  adminNote: { type: String, default: '', maxlength: 2000 },
}, { timestamps: true })

export default mongoose.model('Inquiry', schema)
