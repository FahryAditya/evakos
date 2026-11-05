export default defineEventHandler((event) => {
  clearSessionCookie(event)
  return { success: true, message: 'Berhasil keluar' }
})

