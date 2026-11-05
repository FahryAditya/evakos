import { z } from 'zod'

const updateRoomSchema = z.object({
  name: z.string().min(2, 'Nama kamar minimal 2 karakter').optional(),
  price: z.coerce.number().positive('Harga sewa harus lebih dari 0').optional(),
  description: z.string().optional(),
  facilities: z.array(z.string()).optional(),
  status: z.enum(['AVAILABLE', 'RENTED']).optional(),
  order: z.coerce.number().optional(),
  imageUrls: z.array(z.string()).optional(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID kamar tidak valid',
    })
  }

  const body = await readBody(event)
  const validation = updateRoomSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.issues?.[0]?.message || 'Input data tidak valid',
    })
  }

  const { imageUrls, ...dataToUpdate } = validation.data

  // If imageUrls is provided, replace existing images
  if (imageUrls !== undefined) {
    await prisma.roomImage.deleteMany({
      where: { roomId: id },
    })
    if (imageUrls.length > 0) {
      await prisma.roomImage.createMany({
        data: imageUrls.map((url, index) => ({
          roomId: id,
          url,
          isPrimary: index === 0,
        })),
      })
    }
  }

  const room = await prisma.room.update({
    where: { id },
    data: dataToUpdate,
    include: {
      images: {
        orderBy: { isPrimary: 'desc' },
      },
    },
  })

  return {
    success: true,
    data: room,
  }
})

