export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug kamar tidak valid',
    })
  }

  const room = await prisma.room.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { isPrimary: 'desc' },
      },
    },
  })

  if (!room) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Kamar tidak ditemukan',
    })
  }

  return {
    success: true,
    data: room,
  }
})

