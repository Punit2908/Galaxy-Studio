import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import mongoose from 'mongoose'
import { fileURLToPath } from 'node:url'
import MediaAsset from '../src/models/MediaAsset.js'
import Album from '../src/models/Album.js'
import User from '../src/models/User.js'
import { uploadToStorage } from '../src/services/mediaStorage.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '../../client/public')

const mimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
}

function inferType(name, ext) {
  const lower = name.toLowerCase()
  if (lower.includes('drone')) return 'drone'
  if (lower.includes('cinematic')) return 'cinematic'
  if (lower.includes('portrait')) return 'portrait'
  if (lower.includes('prewedding')) return 'other'
  return ext.startsWith('.mp4') || ext === '.mov' || ext === '.webm' ? 'wedding' : 'wedding'
}

function titleFromFilename(name) {
  return name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
}

async function main() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.')
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
  }

  await mongoose.connect(process.env.MONGO_URI)
  const admin = await User.findOne({ email: process.env.SUPER_ADMIN_EMAIL?.toLowerCase().trim() })
  if (!admin) throw new Error('Super admin was not found. Start the server once so bootstrapSuperAdmin creates it.')

  const files = await fs.readdir(publicDir, { withFileTypes: true })
  const mediaFiles = files
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm', '.mov'].includes(path.extname(name).toLowerCase()))
    .filter((name) => !['logo.png', 'icon.png'].includes(name))

  let album = await Album.findOne({ slug: 'public-archive' })
  if (!album) {
    album = await Album.create({
      title: 'Galaxy Public Archive',
      slug: 'public-archive',
      description: 'Media migrated from the website public folder.',
      isPublished: true,
      createdBy: admin._id,
    })
  }

  let uploaded = 0
  let skipped = 0

  for (const filename of mediaFiles) {
    const ext = path.extname(filename).toLowerCase()
    const existing = await MediaAsset.findOne({ filename })
    if (existing) {
      if (!album.media.some((item) => item.asset.toString() === existing._id.toString())) {
        album.media.push({ asset: existing._id, sortOrder: album.media.length })
      }
      skipped += 1
      continue
    }

    const filePath = path.join(publicDir, filename)
    const buffer = await fs.readFile(filePath)
    const mediaType = mimeTypes[ext].startsWith('video/') ? 'video' : 'image'
    const contentType = inferType(filename, ext)
    const folder = mediaType === 'video' ? 'videos' : 'images'
    const stored = await uploadToStorage(buffer, mimeTypes[ext], filename, folder)

    const media = await MediaAsset.create({
      storagePath: stored.path,
      publicUrl: stored.url,
      filename,
      title: titleFromFilename(filename),
      altText: titleFromFilename(filename),
      description: 'Migrated from the Galaxy Photography website public folder.',
      mediaType,
      contentType,
      mimeType: mimeTypes[ext],
      sizeBytes: buffer.length,
      folder,
      uploadedBy: admin._id,
      isPublished: true,
    })

    album.media.push({ asset: media._id, sortOrder: album.media.length })
    if (!album.coverMedia && mediaType === 'image') album.coverMedia = media._id
    uploaded += 1
    console.log(`Uploaded: ${filename}`)
  }

  await album.save()
  console.log(`\nMigration complete. Uploaded: ${uploaded}. Already registered: ${skipped}. Album: Galaxy Public Archive.`)
  await mongoose.disconnect()
}

main().catch(async (error) => {
  console.error('\nMigration failed:', error.message)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
