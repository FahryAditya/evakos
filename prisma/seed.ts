import 'dotenv/config'
import argon2 from 'argon2'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

async function main() {
  console.log('Seeding EvaKos database...')

  // 1. Seed Admin Villa
  const hashedPassword = await argon2.hash('admin123')
  const admin = await prisma.user.upsert({
    where: { email: 'villa@evakos.com' },
    update: {},
    create: {
      email: 'villa@evakos.com',
      password: hashedPassword,
      name: 'Villa (Pemilik Kos)',
    },
  })
  console.log('Admin seeded:', admin.email)

  // 2. Seed Setting
  const setting = await prisma.setting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      kosName: 'EvaKos Eksklusif',
      ownerName: 'Villa',
      whatsapp: '6281234567890',
      address: 'Jl. Merpati No. 18, Pusat Kota',
      mapsUrl: 'https://maps.google.com',
    },
  })
  console.log('Setting seeded:', setting.kosName)

  // 3. Seed Demo Rooms
  const existingRooms = await prisma.room.count()
  if (existingRooms === 0) {
    await prisma.room.create({
      data: {
        name: 'Kamar 01 - Tipe Deluxe (AC & KM Dalam)',
        slug: 'kamar-01-tipe-deluxe',
        price: 950000,
        description: 'Kamar luas 4x4 meter dilengkapi AC dingin, kasur springbed queen, kamar mandi dalam dengan shower, lemari pakaian 2 pintu, dan meja belajar.',
        facilities: ['AC', 'Kamar Mandi Dalam', 'Kasur Springbed', 'WiFi Cepat', 'Lemari Pakaian', 'Meja Kerja'],
        status: 'AVAILABLE',
        order: 1,
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80',
              isPrimary: true,
            },
            {
              url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
              isPrimary: false,
            },
          ],
        },
      },
    })

    await prisma.room.create({
      data: {
        name: 'Kamar 02 - Tipe Superior (KM Dalam)',
        slug: 'kamar-02-tipe-superior',
        price: 750000,
        description: 'Kamar nyaman dan tenang ukuran 3x3.5 meter. Dilengkapi kipas angin plafon, kasur busa tebal, kamar mandi dalam, dan ventilasi udara segar.',
        facilities: ['Kamar Mandi Dalam', 'Kasur Busa Tebal', 'Kipas Angin', 'WiFi Cepat', 'Lemari'],
        status: 'AVAILABLE',
        order: 2,
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80',
              isPrimary: true,
            },
          ],
        },
      },
    })

    await prisma.room.create({
      data: {
        name: 'Kamar 03 - Tipe Standard (KM Luar)',
        slug: 'kamar-03-tipe-standard',
        price: 550000,
        description: 'Kamar ekonomis dan bersih ukuran 3x3 meter. Dekat dengan dapur bersama, kasur single bed, dan lemari.',
        facilities: ['Kasur Single Bed', 'Kamar Mandi Luar', 'WiFi Cepat', 'Dapur Bersama'],
        status: 'RENTED',
        order: 3,
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop&q=80',
              isPrimary: true,
            },
          ],
        },
      },
    })

    console.log('Sample rooms seeded!')
  }

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

