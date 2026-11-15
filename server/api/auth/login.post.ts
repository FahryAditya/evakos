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

    const rawMsg = String(err?.message || '')
    let userFriendlyMessage = 'Terjadi kesalahan pada server saat login'

    if (
      rawMsg.includes('tenant') ||
      rawMsg.includes('ENOTFOUND') ||
      rawMsg.includes('XX000') ||
      rawMsg.includes("Can't reach database server") ||
      rawMsg.includes('Connection terminated')
    ) {
      userFriendlyMessage =
        'Koneksi database Supabase tidak terhubung atau sedang dinonaktifkan (paused). Silakan aktifkan kembali proyek database Anda di Supabase Dashboard.'
    } else if (rawMsg.includes('password authentication failed')) {
      userFriendlyMessage = 'Autentikasi database gagal. Periksa kredensial database di file .env.'
    }

    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: userFriendlyMessage,
    })
  }
})
