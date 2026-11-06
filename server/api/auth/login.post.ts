import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password harus diisi'),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: validation.error.issues?.[0]?.message || 'Input tidak valid',
      })
    }

    const { email, password } = validation.data

    if (!process.env.DATABASE_URL) {
      throw createError({
        statusCode: 500,
        statusMessage: 'DATABASE_URL belum diatur di Vercel Environment Variables',
      })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Email atau password salah',
      })
    }

    const isValidPassword = await verifyPassword(user.password, password)
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Email atau password salah',
      })
    }

    // Set session cookie
    setSessionCookie(event, user.id)

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }
  } catch (err: any) {
    if (err.statusCode && err.statusCode < 500) {
      throw err
    }
    console.error('Login Handler Error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Terjadi kesalahan pada server saat login',
    })
  }
})
