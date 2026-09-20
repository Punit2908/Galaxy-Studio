import MediaAsset from '../models/MediaAsset.js'
import SiteMedia from '../models/SiteMedia.js'
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.js'

export async function listMedia(req, res) {
  const media = await MediaAsset.find().sort({ createdAt: -1 }).populate('uploadedBy', 'name email')
  res.json({ media })
}

export async function uploadMedia(req, res) {
  if (!req.file) return res.status(400).json({ message: 'A media file is required.' })

  const result = await uploadToCloudinary(req.file.buffer, {
    resourceType: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
    folder: req.body.folder || 'galaxy-studio',
  })

  const media = await MediaAsset.create({
    title: req.body.title,
    alt: req.body.alt,
    description: req.body.description,
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    duration: result.duration,
    folder: result.asset_folder || req.body.folder || 'galaxy-studio',
    uploadedBy: req.user._id,
  })

  res.status(201).json({ media })
}

export async function updateMedia(req, res) {
  const allowed = ['title', 'alt', 'description']
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)))
  const media = await MediaAsset.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
  if (!media) return res.status(404).json({ message: 'Media asset not found.' })
  res.json({ media })
}

export async function assignSlot(req, res) {
  const { slot, mediaId } = req.body
  if (!slot || !mediaId) return res.status(400).json({ message: 'slot and mediaId are required.' })

  const media = await MediaAsset.findById(mediaId)
  if (!media) return res.status(404).json({ message: 'Media asset not found.' })

  const assignment = await SiteMedia.findOneAndUpdate(
    { slot },
    { media: media._id, updatedBy: req.user._id },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).populate('media')

  res.json({ assignment })
}

export async function listSlots(_req, res) {
  const slots = await SiteMedia.find().sort({ slot: 1 }).populate('media')
  res.json({ slots })
}

export async function deleteMedia(req, res) {
  const media = await MediaAsset.findById(req.params.id)
  if (!media) return res.status(404).json({ message: 'Media asset not found.' })

  const assigned = await SiteMedia.exists({ media: media._id })
  if (assigned) return res.status(409).json({ message: 'This media is assigned to a website slot. Replace the slot first.' })

  await deleteFromCloudinary(media.publicId, media.resourceType)
  await media.deleteOne()
  res.json({ message: 'Media deleted successfully.' })
}

export async function removeSlot(req, res) {
  const result = await SiteMedia.findOneAndDelete({ slot: req.params.slot })
  if (!result) return res.status(404).json({ message: 'Website media slot not found.' })
  res.json({ message: 'Website media slot cleared.' })
}
