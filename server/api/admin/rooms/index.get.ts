export default defineEventHandler(async () => {
  const [rooms, totalRooms, availableRooms, rentedRooms] = await Promise.all([
    prisma.room.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        images: {
          orderBy: { isPrimary: 'desc' },
        },
      },
    }),
    prisma.room.count(),
    prisma.room.count({ where: { status: 'AVAILABLE' } }),
    prisma.room.count({ where: { status: 'RENTED' } }),
  ])

  return {
    success: true,
    data: rooms,
    stats: {
      total: totalRooms,
      available: availableRooms,
      rented: rentedRooms,
    },
  }
})

