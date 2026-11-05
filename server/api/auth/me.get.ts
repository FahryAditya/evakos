export default defineEventHandler(async (event) => {
  const user = await getUserFromSession(event)
  if (!user) {
    return { authenticated: false, user: null }
  }
  return { authenticated: true, user }
})

