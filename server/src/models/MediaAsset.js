import mongoose from 'mongoose'

const mediaAssetSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, maxlength: 160 },
    alt: { type: String, trim: true, maxlength: 240 },
    description: { type: String, trim: true, maxlength: 500 },
    url: { type: String, required: true },
    publicId: { type: String, required: true, unique: true },
    resourceType: { type: String, enum: ['image', 'video', 'raw'], required: true },
    format: String,
    width: Number,
    height: Number,
    bytes: Number,
    duration: Number,
    folder: { type: String, default: 'galaxy-studio' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

export default mongoose.model('MediaAsset', mediaAssetSchema)
