import path from 'node:path'
import fs from 'node:fs/promises'
import crypto from 'node:crypto'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default defineEventHandler(async (event) => {
  const multipartData = await readMultipartFormData(event)

  if (!multipartData || multipartData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tidak ada file yang diunggah',
    })
  }

  const uploadDir = path.resolve(process.cwd(), 'public/uploads')
  await fs.mkdir(uploadDir, { recursive: true })

  const uploadedUrls: string[] = []

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
        statusMessage: `Ukuran file ${part.filename} melebihi batas 5MB.`,
      })
    }

    const ext = path.extname(part.filename).toLowerCase() || '.jpg'
    const uniqueFileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`
    const targetFilePath = path.join(uploadDir, uniqueFileName)

    await fs.writeFile(targetFilePath, part.data)
    uploadedUrls.push(`/uploads/${uniqueFileName}`)
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

