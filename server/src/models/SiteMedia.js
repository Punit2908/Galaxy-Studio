import mongoose from 'mongoose'

const siteMediaSchema = new mongoose.Schema(
  {
    slot: { type: String, required: true, unique: true, trim: true, index: true },
    media: { type: mongoose.Schema.Types.ObjectId, ref: 'MediaAsset', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

export default mongoose.model('SiteMedia', siteMediaSchema)
