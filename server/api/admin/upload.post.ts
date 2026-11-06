import path from 'node:path'
import fs from 'node:fs/promises'
import crypto from 'node:crypto'
import { v2 as cloudinary } from 'cloudinary'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Configure Cloudinary if credentials are present
const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
)

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

function uploadToCloudinary(buffer: Buffer, folder = 'evakos'): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Upload ke Cloudinary gagal'))
        }
        resolve(result.secure_url)
      }
    )
    uploadStream.end(buffer)
  })
}

export default defineEventHandler(async (event) => {
  const multipartData = await readMultipartFormData(event)

  if (!multipartData || multipartData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tidak ada file yang diunggah',
    })
  }

  const uploadedUrls: string[] = []

  // Check if Cloudinary is configured
  const useCloudinary = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )

  let uploadDir = ''
  if (!useCloudinary) {
    uploadDir = path.resolve(process.cwd(), 'public/uploads')
    await fs.mkdir(uploadDir, { recursive: true })
  }

  for (const part of multipartData) {
    if (!part.filename || !part.type || !part.data) continue

    if (!ALLOWED_MIME_TYPES.includes(part.type.toLowerCase())) {
      throw createError({
        statusCode: 400,
        statusMessage: `Format file ${part.filename} tidak didukung. Gunakan JPG, PNG, atau WEBP.`,
      })
    }

    if (part.data.length > MAX_FILE_SIZE) {
      throw createError({
        statusCode: 400,
        statusMessage: `Ukuran file ${part.filename} melebihi batas 10MB.`,
      })
    }

    if (useCloudinary) {
      // Upload directly to Cloudinary
      const secureUrl = await uploadToCloudinary(part.data)
      uploadedUrls.push(secureUrl)
    } else {
      // Fallback local upload
      const ext = path.extname(part.filename).toLowerCase() || '.jpg'
      const uniqueFileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`
      const targetFilePath = path.join(uploadDir, uniqueFileName)

      await fs.writeFile(targetFilePath, part.data)
      uploadedUrls.push(`/uploads/${uniqueFileName}`)
    }
  }

  if (uploadedUrls.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Gagal mengunggah file gambar',
    })
  }

  return {
    success: true,
    urls: uploadedUrls,
  }
})
