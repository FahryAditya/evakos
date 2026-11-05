export default defineEventHandler(async (event) => {
  const path = getRequestPath(event)

  if (path.startsWith('/api/admin')) {
    const user = await getUserFromSession(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized: Sesi login tidak valid atau telah berakhir.',
      })
    }
    // Attach user to context for use in event handlers
    event.context.user = user
  }
})

