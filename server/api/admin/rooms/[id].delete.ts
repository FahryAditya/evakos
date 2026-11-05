export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID kamar tidak valid',
    })
  }

  await prisma.room.delete({
    where: { id },
  })

  return {
    success: true,
    message: 'Kamar berhasil dihapus',
  }
})

