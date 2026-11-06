import 'dotenv/config'
import pg from 'pg'
import argon2 from 'argon2'
import { v2 as cloudinary } from 'cloudinary'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client.js'
import { createSessionToken, verifySessionToken } from './server/utils/auth.js'

const { Pool } = pg

const rawUrl = process.env.DATABASE_URL || ''
const cleanUrl = rawUrl.replace(/[?&]sslmode=[^&]+/, '').replace(/[?&]pgbouncer=[^&]+/, '')

const pool = new Pool({
  connectionString: cleanUrl,
  ssl: { rejectUnauthorized: false },
})

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
})

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

async function runTests() {
  console.log('==================================================')
  console.log('🚀 MEMULAI PENGUJIAN LOGIC & INTEGRASI EVAKOS')
  console.log('==================================================\n')

  let passed = 0
  let failed = 0

  // --------------------------------------------------
  // TEST 1: TEST LOGIN & AUTENTIKASI ARGON2
  // --------------------------------------------------
  console.log('👉 [TEST 1] Pengujian Autentikasi Admin Villa...')
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'villa@evakos.com' },
    })

    if (!user) {
      throw new Error('User villa@evakos.com tidak ditemukan di database!')
    }
    console.log('   ✓ User ditemukan:', user.email, '| Name:', user.name)

    const isMatch = await argon2.verify(user.password, 'admin123')
    if (!isMatch) {
      throw new Error('Verifikasi password Argon2 gagal!')
    }
    console.log('   ✓ Verifikasi Argon2 password "admin123" BERHASIL!')

    // Test token session creation & verification
    const token = createSessionToken(user.id)
    const verified = verifySessionToken(token)
    if (!verified || verified.userId !== user.id) {
      throw new Error('Verifikasi session token gagal!')
    }
    console.log('   ✓ Enkripsi & verifikasi session token BERHASIL!')
    passed++
  } catch (err) {
    console.error('   ❌ TEST 1 GAGAL:', err.message)
    failed++
  }

  // --------------------------------------------------
  // TEST 2: TEST UPLOAD GAMBAR KE CLOUDINARY
  // --------------------------------------------------
  console.log('\n👉 [TEST 2] Pengujian Upload Gambar ke Cloudinary...')
  let uploadedCloudinaryUrl = ''
  try {
    // 1x1 pixel PNG transparent buffer
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    const imageBuffer = Buffer.from(testImageBase64, 'base64')

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'evakos/test' },
        (error, result) => {
          if (error) return reject(error)
          resolve(result)
        }
      )
      stream.end(imageBuffer)
    })

    uploadedCloudinaryUrl = uploadResult.secure_url
    console.log('   ✓ Upload ke Cloudinary BERHASIL!')
    console.log('   ✓ URL Gambar Cloudinary:', uploadedCloudinaryUrl)
    console.log('   ✓ Public ID:', uploadResult.public_id)
    passed++
  } catch (err) {
    console.error('   ❌ TEST 2 GAGAL:', err.message)
    failed++
  }

  // --------------------------------------------------
  // TEST 3: TEST CRUD KAMAR & FAST 1-CLICK STATUS TOGGLE
  // --------------------------------------------------
  console.log('\n👉 [TEST 3] Pengujian CRUD Kamar & Fast Status Toggle...')
  let testRoomId = ''
  try {
    // 1. Create Room dengan foto dari Cloudinary
    const newRoom = await prisma.room.create({
      data: {
        name: 'Kamar Tes Otomatis (Cloudinary & Supabase)',
        slug: `kamar-tes-${Date.now()}`,
        price: 850000,
        description: 'Kamar pengujian integrasi database Supabase dan Cloudinary.',
        facilities: ['AC', 'WiFi Cepat', 'Kamar Mandi Dalam'],
        status: 'AVAILABLE',
        order: 99,
        images: {
          create: [
            {
              url: uploadedCloudinaryUrl || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af',
              isPrimary: true,
            },
          ],
        },
      },
      include: {
        images: true,
      },
    })
    testRoomId = newRoom.id
    console.log('   ✓ Berhasil membuat kamar baru di Supabase. ID:', testRoomId)
    console.log('   ✓ Status awal:', newRoom.status)

    // 2. Test Fast Toggle 1-Click: AVAILABLE -> RENTED
    const toggledToRented = await prisma.room.update({
      where: { id: testRoomId },
      data: { status: 'RENTED' },
    })
    if (toggledToRented.status !== 'RENTED') {
      throw new Error('Gagal toggle status ke RENTED!')
    }
    console.log('   ✓ Fast Toggle ke RENTED BERHASIL!')

    // 3. Test Fast Toggle 1-Click: RENTED -> AVAILABLE
    const toggledToAvailable = await prisma.room.update({
      where: { id: testRoomId },
      data: { status: 'AVAILABLE' },
    })
    if (toggledToAvailable.status !== 'AVAILABLE') {
      throw new Error('Gagal toggle status kembali ke AVAILABLE!')
    }
    console.log('   ✓ Fast Toggle kembali ke AVAILABLE BERHASIL!')

    // 4. Query Public Rooms: Pastikan kamar terbaca dengan relasi gambar
    const publicRooms = await prisma.room.findMany({
      where: { id: testRoomId },
      include: { images: true },
    })
    if (publicRooms.length === 0 || publicRooms[0].images.length === 0) {
      throw new Error('Gagal membaca relasi kamar dan gambar!')
    }
    console.log('   ✓ Query katalog publik kamar beserta gambar Cloudinary BERHASIL!')

    // 5. Cleanup test room
    await prisma.room.delete({ where: { id: testRoomId } })
    console.log('   ✓ Pembersihan data kamar tes selesai!')
    passed++
  } catch (err) {
    console.error('   ❌ TEST 3 GAGAL:', err.message)
    failed++
  }

  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------
  console.log('\n==================================================')
  console.log(`🏁 HASIL PENGUJIAN: ${passed} LULUS, ${failed} GAGAL`)
  console.log('==================================================\n')

  await prisma.$disconnect()
  await pool.end()

  process.exit(failed > 0 ? 1 : 0)
}

runTests().catch(console.error)

