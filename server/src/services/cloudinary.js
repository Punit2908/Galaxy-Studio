import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'node:stream'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'galaxy-studio',
        resource_type: options.resourceType || 'auto',
      },
      (error, result) => (error ? reject(error) : resolve(result)),
    )
    Readable.from(buffer).pipe(stream)
  })
}

export function deleteFromCloudinary(publicId, resourceType = 'image') {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  })
}
