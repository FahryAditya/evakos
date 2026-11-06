export default defineEventHandler(async () => {
  let dbStatus = 'untested'
  let dbError = null

  try {
    const count = await prisma.room.count()
    dbStatus = `connected (rooms: ${count})`
  } catch (err: any) {
    dbStatus = 'error'
    dbError = err?.message || String(err)
  }

  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      databaseUrlPrefix: process.env.DATABASE_URL
        ? process.env.DATABASE_URL.slice(0, 16) + '...'
        : 'NOT_SET',
      hasSessionSecret: Boolean(process.env.SESSION_SECRET),
      hasCloudinaryName: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    },
    database: {
      status: dbStatus,
      error: dbError,
    },
  }
})
