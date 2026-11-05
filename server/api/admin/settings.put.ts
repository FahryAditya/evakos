import { z } from 'zod'

const settingsSchema = z.object({
  kosName: z.string().min(1, 'Nama kos harus diisi'),
  ownerName: z.string().min(1, 'Nama pemilik harus diisi'),
  whatsapp: z.string().min(8, 'Nomor WhatsApp tidak valid'),
  address: z.string().optional(),
  mapsUrl: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validation = settingsSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.issues?.[0]?.message || 'Input pengaturan tidak valid',
    })
  }

  // Format WhatsApp number to standard international without '+' or spaces (e.g. 628...)
  let cleanWa = validation.data.whatsapp.replace(/\D/g, '')
  if (cleanWa.startsWith('08')) {
    cleanWa = '62' + cleanWa.slice(1)
  }

  const updatedSetting = await prisma.setting.upsert({
    where: { id: 'default' },
    update: {
      ...validation.data,
      whatsapp: cleanWa,
    },
    create: {
      id: 'default',
      ...validation.data,
      whatsapp: cleanWa,
    },
  })

  return {
    success: true,
    data: updatedSetting,
    message: 'Pengaturan berhasil diperbarui',
  }
})

