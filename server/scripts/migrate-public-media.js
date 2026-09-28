import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import mongoose from 'mongoose'
import { fileURLToPath } from 'node:url'
import MediaAsset from '../src/models/MediaAsset.js'
import Album from '../src/models/Album.js'
import SiteMedia from '../src/models/SiteMedia.js'
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

  let album = await Album.findOne({ slug: 'public-archive' })
  if (!album) {
    album = await Album.create({
      title: 'Galaxy Public Archive',
      slug: 'public-archive',
      description: 'Media migrated from the website public folder, including the official site logo.',
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

  const heroBackground = await MediaAsset.find({ filename: { $in: ['Video 1.mp4', 'Video 2.mp4', 'Video 3.mp4'] } })
  const heroRing = await MediaAsset.findOne({ filename: 'image.png' })

  if (heroBackground.length && !(await SiteMedia.exists({ slot: 'home.hero.background' }))) {
    await SiteMedia.create({
      slot: 'home.hero.background',
      media: heroBackground[0]._id,
      mediaItems: heroBackground.map((item) => item._id),
      useFallback: false,
      updatedBy: admin._id,
    })
  }

  if (heroRing && !(await SiteMedia.exists({ slot: 'home.hero.ring' }))) {
    await SiteMedia.create({
      slot: 'home.hero.ring',
      media: heroRing._id,
      mediaItems: [heroRing._id],
      useFallback: false,
      updatedBy: admin._id,
    })
  }

  const storySeeds = [
    {
      slot: 'home.story.01',
      background: 'Ashwani and Tarun.jpeg',
      items: ['Ashwani.jpeg', 'image.png', 'Ashwani and Tarun.jpeg', 'Video 1.mp4'],
    },
    {
      slot: 'home.story.02',
      background: 'Anita and Sunil.png',
      items: ['Video 2.mp4', 'Video 3.mp4', 'image.png', 'Ashwani and Tarun.jpeg'],
    },
    {
      slot: 'home.story.03',
      background: 'Drone Shot 1.png',
      items: ['Drone Shot 1.png', 'Drone  Shot 2.png', 'Drone Shot 3.mp4', 'Anita and Sunil.png'],
    },
    {
      slot: 'home.story.04',
      background: 'Ashwani.jpeg',
      items: ['Ashwani and Tarun.jpeg', 'Ashwani.jpeg', 'Video 4.mp4', 'image.png'],
    },
  ]

  for (const story of storySeeds) {
    if (await SiteMedia.exists({ slot: story.slot })) continue
    const background = await MediaAsset.findOne({ filename: story.background })
    const items = await MediaAsset.find({ filename: { $in: story.items } })
    const ordered = story.items
      .map((filename) => items.find((item) => item.filename === filename))
      .filter(Boolean)

    if (!background || ordered.length !== story.items.length) continue

    await SiteMedia.create({
      slot: story.slot,
      media: ordered[0]._id,
      mediaItems: ordered.map((item) => item._id),
      backgroundMedia: background._id,
      useFallback: false,
      updatedBy: admin._id,
    })
  }

  console.log(`\nMigration complete. Uploaded: ${uploaded}. Already registered: ${skipped}. Album: Galaxy Public Archive.`)
  await mongoose.disconnect()
}

main().catch(async (error) => {
  console.error('\nMigration failed:', error.message)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
