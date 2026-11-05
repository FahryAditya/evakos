import { z } from 'zod'

const statusSchema = z.object({
  status: z.enum(['AVAILABLE', 'RENTED']),
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
  const validation = statusSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Status harus AVAILABLE atau RENTED',
    })
  }

  const updatedRoom = await prisma.room.update({
    where: { id },
    data: { status: validation.data.status },
  })

  return {
    success: true,
    data: updatedRoom,
    message: `Status kamar berhasil diubah menjadi ${validation.data.status === 'AVAILABLE' ? 'Tersedia' : 'Tersewa'}`,
  }
})

