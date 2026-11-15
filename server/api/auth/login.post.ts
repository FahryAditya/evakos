import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().optional(),
  username: z.string().optional(),
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

    const rawIdentifier = validation.data.username || validation.data.email || ''
    if (!rawIdentifier.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username atau email harus diisi',
      })
    }

    const { password } = validation.data
    const identifier = rawIdentifier.toLowerCase().trim()

    if (!process.env.DATABASE_URL) {
      throw createError({
        statusCode: 500,
        statusMessage: 'DATABASE_URL belum diatur di Vercel Environment Variables',
      })
    }

    if (process.env.DATABASE_URL.includes('supabase')) {
      throw createError({
        statusCode: 500,
        statusMessage: 'DATABASE_URL di Vercel masih menggunakan Supabase lama yang nonaktif. Harap perbarui variabel DATABASE_URL di Vercel Dashboard ke Neon.',
      })
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { email: `${identifier}@evakos.com` },
        ],
      },
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Username atau password salah',
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

    const rawMsg = String(err?.message || '')
    let userFriendlyMessage = err.statusMessage || 'Terjadi kesalahan pada server saat login'

    if (
      rawMsg.includes('tenant') ||
      rawMsg.includes('ENOTFOUND') ||
      rawMsg.includes('XX000') ||
      rawMsg.includes("Can't reach database server") ||
      rawMsg.includes('Connection terminated')
    ) {
      userFriendlyMessage =
        'Koneksi database tidak terhubung atau sedang dinonaktifkan. Jika menggunakan Vercel, pastikan variabel DATABASE_URL di Vercel Dashboard sudah diganti ke Neon.'
    } else if (rawMsg.includes('password authentication failed')) {
      userFriendlyMessage = 'Autentikasi database gagal. Periksa kredensial database di Environment Variables.'
    }

    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: userFriendlyMessage,
      data: {
        message: userFriendlyMessage,
        raw: process.env.NODE_ENV !== 'production' ? rawMsg : undefined,
      },
    })
  }
})
