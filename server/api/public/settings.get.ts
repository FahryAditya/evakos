export default defineEventHandler(async () => {
  let setting = await prisma.setting.findUnique({
    where: { id: 'default' },
  })

  if (!setting) {
    setting = await prisma.setting.create({
      data: {
        id: 'default',
        kosName: 'EvaKos',
        ownerName: 'Villa',
        whatsapp: '6281234567890',
        address: 'Jl. Contoh Alamat Kos No. 12',
      },
    })
  }

  return {
    success: true,
    data: setting,
  }
})

