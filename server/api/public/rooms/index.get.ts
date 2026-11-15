export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const statusFilter = query.status as string | undefined

  const whereClause: Record<string, any> = {}
  if (statusFilter && (statusFilter === 'AVAILABLE' || statusFilter === 'RENTED')) {
    whereClause.status = statusFilter
  }

  try {
    const rooms = await prisma.room.findMany({
      where: whereClause,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        images: {
          orderBy: { isPrimary: 'desc' },
        },
      },
    })

    return {
      success: true,
      data: rooms,
    }
  } catch (err: any) {
    console.warn('Database offline / returning empty rooms list:', err?.message)
    return {
      success: true,
      data: [],
    }
  }
})

