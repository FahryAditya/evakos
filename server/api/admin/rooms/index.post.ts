import { z } from 'zod'

const createRoomSchema = z.object({
  name: z.string().min(2, 'Nama kamar minimal 2 karakter'),
  price: z.coerce.number().positive('Harga sewa harus lebih dari 0'),
  description: z.string().default(''),
  facilities: z.array(z.string()).default([]),
  status: z.enum(['AVAILABLE', 'RENTED']).default('AVAILABLE'),
  order: z.coerce.number().default(0),
  imageUrls: z.array(z.string()).default([]),
})

function generateSlug(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${base}-${Date.now().toString().slice(-4)}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validation = createRoomSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.issues?.[0]?.message || 'Input data kamar tidak valid',
    })
  }

  const { name, price, description, facilities, status, order, imageUrls } = validation.data
  const slug = generateSlug(name)

  const room = await prisma.room.create({
    data: {
      name,
      slug,
      price,
      description,
      facilities,
      status,
      order,
      images: {
        create: imageUrls.map((url, index) => ({
          url,
          isPrimary: index === 0,
        })),
      },
    },
    include: {
      images: true,
    },
  })

  return {
    success: true,
    data: room,
  }
})

