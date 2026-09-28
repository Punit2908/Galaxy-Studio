import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  storagePath: { type: String, required: true, unique: true },
  publicUrl: { type: String, required: true },
  filename: { type: String, required: true },
  title: { type: String, default: '', trim: true, maxlength: 160 },
  altText: { type: String, default: '', trim: true, maxlength: 240 },
  description: { type: String, default: '', trim: true, maxlength: 500 },
  mediaType: { type: String, enum: ['image', 'video'], required: true, index: true },
  contentType: {
    type: String,
    enum: ['cinematic', 'drone', 'wedding', 'portrait', 'candid', 'couple', 'ceremony', 'decoration', 'other'],
    default: 'wedding',
    index: true,
  },
  mimeType: { type: String, required: true },
  sizeBytes: { type: Number, default: 0 },
  folder: { type: String, default: 'images' },
  sortOrder: { type: Number, default: 0, index: true },
  isPublished: { type: Boolean, default: true, index: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

export default mongoose.model('MediaAsset', schema)
