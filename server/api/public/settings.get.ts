export default defineEventHandler(async () => {
  const fallbackSetting = {
    id: 'default',
    kosName: 'EvaKos',
    ownerName: 'Villa',
    whatsapp: '6285924936849',
    address: 'Jl. Merpati No. 18, Pusat Kota',
    mapsUrl: 'https://maps.app.goo.gl/PUPXZtA42mDLH2Hx8',
  }

  try {
    let setting = await prisma.setting.findUnique({
      where: { id: 'default' },
    })

    if (!setting) {
      setting = await prisma.setting.create({
        data: fallbackSetting,
      })
    }

    return {
      success: true,
      data: setting,
    }
  } catch (err: any) {
    console.warn('Database offline / using fallback setting:', err?.message)
    return {
      success: true,
      data: fallbackSetting,
    }
  }
})

