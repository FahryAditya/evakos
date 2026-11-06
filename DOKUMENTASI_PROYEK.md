# 📚 Dokumentasi Lengkap Proyek & Logika Program EvaKos

> **EvaKos** adalah aplikasi web modern yang berfungsi ganda sebagai **Katalog Promosi Kos Interaktif** (sisi publik untuk calon penyewa) dan **Content Management System / CMS** (sisi privat untuk pemilik kos, kak Villa).
> Aplikasi ini dibangun di atas ekosistem **Nuxt 4**, **Tailwind CSS v4**, **Prisma 7 (PostgreSQL)**, dan **Argon2**.

---

## 📑 Daftar Isi
1. [Ringkasan & Filosofi Proyek](#1-ringkasan--filosofi-proyek)
2. [Tech Stack & Dependensi](#2-tech-stack--dependensi)
3. [Struktur Folder & Penjelasan File](#3-struktur-folder--penjelasan-file)
4. [Skema Database & Diagram Entitas (Prisma ORM)](#4-skema-database--diagram-entitas-prisma-orm)
5. [Arsitektur Sistem & Alur Data](#5-arsitektur-sistem--alur-data)
6. [Logika Program Backend (Server Nitro & API)](#6-logika-program-backend-server-nitro--api)
   - [A. Logika Autentikasi & Keamanan Sesi](#a-logika-autentikasi--keamanan-sesi)
   - [B. Logika Fast 1-Click Status Toggle](#b-logika-fast-1-click-status-toggle)
   - [C. Logika Manajemen Kamar (CRUD & Slug)](#c-logika-manajemen-kamar-crud--slug)
   - [D. Logika Upload Gambar Multi-File](#d-logika-upload-gambar-multi-file)
   - [E. Logika Pengaturan Profil & WhatsApp](#e-logika-pengaturan-profil--whatsapp)
7. [Logika Program Frontend (Vue 3 / Nuxt 4)](#7-logika-program-frontend-vue-3--nuxt-4)
   - [A. Logika Filter & Pencarian Reaktif](#a-logika-filter--pencarian-reaktif)
   - [B. Logika Smart WhatsApp URL Generator](#b-logika-smart-whatsapp-url-generator)
   - [C. Logika Galeri Foto & Lightbox Modal](#c-logika-galeri-foto--lightbox-modal)
   - [D. Logika Dashboard Admin & Optimistic UI](#d-logika-dashboard-admin--optimistic-ui)
   - [E. Logika Global Toast Notification](#e-logika-global-toast-notification)
8. [Katalog Endpoint API](#8-katalog-endpoint-api)
9. [Panduan Instalasi & Menjalankan Proyek](#9-panduan-instalasi--menjalankan-proyek)

---

## 1. Ringkasan & Filosofi Proyek

EvaKos dirancang untuk menyelesaikan dua tantangan utama dalam pengelolaan bisnis kos-kosan:
1. **Calon Penyewa**: Seringkali bingung mengenai ketersediaan kamar yang aktual, harga yang transparan, dan fasilitas yang didapatkan. EvaKos menghadirkan katalog visual yang responsif, indikator status kamar yang jelas (*Tersedia* vs *Tersewa*), serta tombol langsung terhubung ke WhatsApp pemilik tanpa perlu perantara.
2. **Pemilik Kos (Kak Villa)**: Membutuhkan sistem yang ringkas tanpa birokrasi form rumit. Fitur utama yang dikembangkan adalah **Fast 1-Click Status Toggle**, di mana pemilik cukup mengklik satu tombol untuk mengubah status kamar kapan saja penyewa masuk atau keluar, serta upload galeri foto kamar langsung dari smartphone atau laptop.

---

## 2. Tech Stack & Dependensi

| Layer | Teknologi | Peran & Alasan Pemilihan |
| :--- | :--- | :--- |
| **Framework Fullstack** | **Nuxt 4.6 (Vue 3.5)** | Server-Side Rendering (SSR) untuk SEO katalog publik, file-based routing, dan server engine Nitro untuk backend API terintegrasi. |
| **Styling & CSS** | **Tailwind CSS v4** | Desain utility-first modern berbasis CSS variables, palet warna kustom (*Navy, Yellow Accent, Soft Gray Canvas*), dan responsive typography (*Plus Jakarta Sans*). |
| **Database & ORM** | **Prisma 7 + PostgreSQL** | Pemodelan data type-safe, driver adapter `@prisma/adapter-pg`, migrasi skema deklaratif, dan auto-generated query client. |
| **Security & Enkripsi** | **Argon2 & Node Crypto** | Hashing password standar industri (Argon2) dan verifikasi token sesi HMAC-SHA256 dengan proteksi cookie HTTP-Only. |
| **Validasi Skema** | **Zod 4** | Runtime validation pada semua endpoint API (mencegah data korup dan serangan injeksi). |
| **Icon System** | **@nuxt/icon (Lucide)** | Icon SVG otomatis yang ringan dan konsisten di seluruh antarmuka. |

---

## 3. Struktur Folder & Penjelasan File

```text
evakos/
├── app/                              # Layer Frontend (Nuxt 4 / Vue 3)
│   ├── app.vue                       # Root template aplikasi & wadah Global Toast
│   ├── assets/
│   │   └── css/
│   │       └── main.css              # Styling utama Tailwind v4 & kustomisasi warna
│   ├── components/
│   │   └── ToastNotification.vue     # Komponen alert mengambang dengan transisi
│   ├── composables/
│   │   └── useToast.ts               # Composable global state untuk memicu toast notifikasi
│   ├── layouts/
│   │   ├── default.vue               # Layout publik (Navbar, Footer, WhatsApp Floating Button)
│   │   └── admin.vue                 # Layout 3-kolom khusus admin (Sidebar, Profil, Navigasi)
│   ├── pages/
│   │   ├── index.vue                 # Halaman Katalog Publik (Hero, Search, Filter Tabs, Grid Kamar)
│   │   ├── kamar/
│   │   │   └── [slug].vue            # Halaman detail kamar spesifik (SEO friendly link)
│   │   └── admin/
│   │       ├── index.vue             # Dashboard CMS (Statistik & Fast 1-Click Status Toggle)
│   │       ├── login.vue             # Form login admin pemilik kos
│   │       ├── pengaturan.vue        # Form update nama kos, pemilik, no WA, dan peta
│   │       └── kamar/
│   │           ├── tambah.vue        # Form tambah kamar baru & upload foto
│   │           └── [id]/
│   │               └── edit.vue      # Form edit kamar & urutan foto
│   └── plugins/
│       └── gsap.client.ts            # Plugin animasi GSAP (client-side)
│
├── server/                           # Layer Backend (Nitro Server Engine)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.post.ts         # Verifikasi password Argon2 & generate session cookie
│   │   │   ├── logout.post.ts        # Hapus session cookie
│   │   │   └── me.get.ts             # Ambil data profil admin yang sedang login
│   │   ├── public/
│   │   │   ├── rooms/
│   │   │   │   ├── index.get.ts      # Fetch daftar kamar untuk publik
│   │   │   │   └── [slug].get.ts     # Fetch detail satu kamar berdasarkan slug
│   │   │   └── settings.get.ts       # Ambil informasi kos & nomor WhatsApp publik
│   │   └── admin/
│   │       ├── settings.put.ts       # Update nomor WA & info kos
│   │       ├── upload.post.ts        # Handler upload file foto ke /public/uploads/
│   │       └── rooms/
│   │           ├── index.get.ts      # List kamar untuk dashboard admin beserta statistik
│   │           ├── index.post.ts     # Simpan data kamar baru ke database
│   │           ├── [id].put.ts       # Update data kamar & foto
│   │           ├── [id].delete.ts    # Hapus data kamar beserta relasi fotonya
│   │           └── [id]/
│   │               └── status.patch.ts # Fast toggle status kamar (AVAILABLE <-> RENTED)
│   ├── middleware/
│   │   └── auth.ts                   # Interceptor penjaga route /api/admin/**
│   └── utils/
│       ├── auth.ts                   # Token HMAC-SHA256, session cookie set/clear/verify
│       ├── password.ts               # Wrapper argon2.hash dan argon2.verify
│       └── prisma.ts                 # Inisialisasi Prisma Client & adapter PG
│
├── prisma/                           # Layer Database & ORM
│   ├── schema.prisma                 # Definisi model PostgreSQL (User, Room, RoomImage, Setting)
│   └── seed.ts                       # Script seed data awal admin, setting, dan 3 kamar demo
│
├── public/                           # Aset Statis
│   └── uploads/                      # Direktori penyimpanan file gambar yang diupload
│
├── nuxt.config.ts                    # Konfigurasi Nuxt 4 (Tailwind, Modules, Routing)
├── package.json                      # Daftar script npm dan dependensi modul
└── .env                              # Variabel rahasia (DATABASE_URL, SESSION_SECRET)
```

---

## 4. Skema Database & Diagram Entitas (Prisma ORM)

Skema database diatur dalam file `prisma/schema.prisma` dengan 4 entitas utama:

```mermaid
erDiagram
    User {
        String id PK "cuid()"
        String email UK "unique"
        String password "Argon2 Hash"
        String name "Nama Admin"
        DateTime createdAt
        DateTime updatedAt
    }

    Room {
        String id PK "cuid()"
        String name "Nama Kamar"
        String slug UK "Slug URL SEO"
        Int price "Harga Sewa / Bulan"
        String description "Deskripsi Fasilitas & Ukuran"
        String[] facilities "Array List Fasilitas"
        RoomStatus status "AVAILABLE | RENTED"
        Int order "Urutan Tampilan"
        DateTime createdAt
        DateTime updatedAt
    }

    RoomImage {
        String id PK "cuid()"
        String url "Path File /uploads/... atau URL Eksternal"
        Boolean isPrimary "Flag Foto Utama"
        String roomId FK "Cascade on delete"
        DateTime createdAt
    }

    Setting {
        String id PK "default"
        String kosName "Nama Kos"
        String ownerName "Nama Pemilik"
        String whatsapp "Nomor WhatsApp (62xxx)"
        String address "Alamat Lengkap"
        String mapsUrl "Link Google Maps"
        DateTime updatedAt
    }

    Room ||--o{ RoomImage : "has many (Cascade Delete)"
```

### Penjelasan Field Kunci:
1. **`RoomStatus` (Enum)**: Memiliki 2 nilai:
   - `AVAILABLE`: Kamar kosong siap huni (ditandai dengan badge hijau di UI).
   - `RENTED`: Kamar sudah terisi (ditandai dengan badge merah di UI).
2. **`Room.facilities`**: Menggunakan tipe data `String[]` native PostgreSQL, memungkinkan penyimpanan fasilitas seperti `["AC", "Kamar Mandi Dalam", "WiFi"]` secara fleksibel tanpa tabel pivot tambahan.
3. **`RoomImage` dengan `onDelete: Cascade`**: Ketika suatu data kamar dihapus dari sistem, semua relasi gambar yang terdaftar di database akan ikut terhapus secara otomatis oleh foreign key constraint PostgreSQL.

---

## 5. Arsitektur Sistem & Alur Data

```mermaid
graph TD
    subgraph Pengunjung Publik
        V[Calon Penyewa] -->|1. Akses Katalog| UI_Publik[app/pages/index.vue]
        UI_Publik -->|2. Klik WhatsApp| WA[WhatsApp API wa.me]
    end

    subgraph Pemilik Kos / Admin
        Adm[Kak Villa] -->|1. Login| UI_Login[app/pages/admin/login.vue]
        Adm -->|2. Fast 1-Click Toggle| UI_Admin[app/pages/admin/index.vue]
        Adm -->|3. Upload Foto Kamar| UI_Upload[app/pages/admin/kamar/tambah.vue]
    end

    subgraph Server Nitro
        AuthMid{server/middleware/auth.ts}
        PublicAPI[server/api/public/*]
        AdminAPI[server/api/admin/*]
        UploadHandler[server/api/admin/upload.post.ts]
    end

    subgraph Database & Storage
        PrismaORM[Prisma Client + PG Adapter]
        DB[(PostgreSQL Database)]
        DiskLocal[/public/uploads/ Folder]
    end

    UI_Publik --> PublicAPI --> PrismaORM --> DB
    UI_Login -->|POST /api/auth/login| AdminAPI
    UI_Admin --> AuthMid --> AdminAPI --> PrismaORM --> DB
    UI_Upload --> AuthMid --> UploadHandler --> DiskLocal
```

---

## 6. Logika Program Backend (Server Nitro & API)

### A. Logika Autentikasi & Keamanan Sesi
Autentikasi dirancang mandiri tanpa dependensi service eksternal, menjamin kecepatan dan keandalan tinggi:
1. **Penyimpanan Password**: Menggunakan algoritma **Argon2** (`server/utils/password.ts`) yang sangat tahan terhadap serangan brute-force dan time-memory trade-off attacks.
2. **Token Berbasis HMAC-SHA256**:
   - Format Token: `base64url(userId:expiresAt:signature)`.
   - `signature` dihasilkan dari `crypto.createHmac('sha256', SESSION_SECRET).update(userId:expiresAt)`.
   - Menggunakan perbandingan timing-safe (`crypto.timingSafeEqual`) untuk menangkal serangan *timing attack*.
3. **Cookie HTTP-Only**:
   - Token disimpan pada cookie bernama `evakos_session`.
   - Konfigurasi: `httpOnly: true` (tidak dapat dibaca via JavaScript document.cookie, kebal XSS), `sameSite: 'lax'`, masa berlaku 7 hari.
4. **Middleware Proteksi (`server/middleware/auth.ts`)**:
   - Mencegat semua request yang diawali `/api/admin/*`.
   - Memvalidasi token sesi. Jika token tidak valid atau expired, server langsung melempar exception `401 Unauthorized` sebelum handler endpoint dieksekusi.

### B. Logika Fast 1-Click Status Toggle
Diterapkan pada endpoint `server/api/admin/rooms/[id]/status.patch.ts`:
1. Menerima payload JSON sederhana: `{ "status": "AVAILABLE" | "RENTED" }`.
2. Validasi schema runtime via Zod enum.
3. Menjalankan query update langsung:
   ```ts
   await prisma.room.update({
     where: { id },
     data: { status: validation.data.status },
   })
   ```
4. Mengembalikan konfirmasi sukses instan sehingga antarmuka admin dapat mengupdate badge secara real-time.

### C. Logika Manajemen Kamar (CRUD & Slug)
- **Pembuatan Slug Otomatis**:
  Fungsi `generateSlug(namaKamar)` mengubah nama kamar (misal: `"Kamar Deluxe 01"`) menjadi format URL yang ramah SEO: `"kamar-deluxe-01-9821"`. Penambahan suffix timestamp pendek 4 digit menjamin tidak terjadi tabrakan unik (*unique constraint violation*).
- **Nested Relation Write**:
  Ketika kamar baru dibuat (`server/api/admin/rooms/index.post.ts`), relasi gambar `RoomImage` dibuat secara atomik dalam satu pemanggilan:
  ```ts
  images: {
    create: imageUrls.map((url, index) => ({
      url,
      isPrimary: index === 0, // Foto pertama otomatis menjadi foto sampul
    }))
  }
  ```

### D. Logika Upload Gambar Multi-File
Diterapkan pada endpoint `server/api/admin/upload.post.ts`:
1. Membaca multipart request melalui helper Nitro `readMultipartFormData(event)`.
2. **Validasi Keamanan**:
   - Memastikan MIME Type hanya file gambar yang diizinkan: `image/jpeg`, `image/png`, `image/webp`.
   - Memeriksa batas ukuran per file maksimal **5MB**.
3. **Penyimpanan Disk Unik**:
   - Mengenerate nama file unik menggunakan kombinasi timestamp dan 6-byte crypto hex:
     `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.jpg`.
   - Menulis binary buffer langsung ke direktori `/public/uploads/`.
   - Mengembalikan array path `/uploads/{uniqueFileName}` untuk disimpan ke database.

### E. Logika Pengaturan Profil & WhatsApp
Endpoint `server/api/admin/settings.put.ts` dan `server/api/public/settings.get.ts`:
- Menggunakan single-record pattern dengan id tetap `"default"`.
- Nomor WhatsApp dibersihkan dari spasi, tanda strip, atau karakter non-numerik, dan dinormalisasi ke format internasional (misal `6281234567890`) agar tautan chat langsung berfungsi di semua perangkat.

---

## 7. Logika Program Frontend (Vue 3 / Nuxt 4)

### A. Logika Filter & Pencarian Reaktif
Diimplementasikan pada `app/pages/index.vue` dan `app/pages/admin/index.vue`:
- Dua state reaktif: `searchQuery` (string) dan `activeFilter` (`'all' | 'AVAILABLE' | 'RENTED'`).
- Menggunakan Vue `computed` property untuk melakukan filtering data kamar di sisi browser secara instan tanpa perlu memanggil ulang server (zero latency):
  ```ts
  const filteredRooms = computed(() => {
    return rooms.value.filter((room) => {
      const matchQuery = room.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      if (!matchQuery) return false
      if (activeFilter.value === 'all') return true
      return room.status === activeFilter.value
    })
  })
  ```

### B. Logika Smart WhatsApp URL Generator
Setiap kartu kamar memiliki tombol WhatsApp cerdas. Fungsi generator merangkai URL WhatsApp langsung ke nomor pengelola dengan draft teks otomatis:
```ts
const getWhatsAppRoomLink = (room: any) => {
  const message = `Halo kak ${setting.value.ownerName}, saya lihat dari website tertarik dengan ${room.name} (Rp ${room.price.toLocaleString('id-ID')}/bulan). Apakah kamar ini masih tersedia?`
  return `https://wa.me/${setting.value.whatsapp}?text=${encodeURIComponent(message)}`
}
```
*Hasil*: Ketika calon penyewa mengklik tombol, aplikasi WhatsApp di HP mereka langsung terbuka dengan nomor kak Villa dan draft pesan yang sudah menyebutkan nama kamar serta harganya secara spesifik.

### C. Logika Galeri Foto & Lightbox Modal
- Tombol **"Lihat Galeri"** pada kartu kamar akan memunculkan modal lightbox (`activeModalRoom`).
- Dilengkapi navigasi slide (Next/Prev foto), thumbnail previewer, dan penutup modal jika mengklik backdrop atau menekan tombol close.

### D. Logika Dashboard Admin & Optimistic UI
Pada halaman `app/pages/admin/index.vue`:
- **Statistik Cepat**: Mengkalkulasi jumlah total kamar, kamar terisi, dan kamar tersedia secara dinamis.
- **Fast Status Toggle**:
  Ketika tombol switch status diklik, method `toggleStatus(room)` mengirim `PATCH` ke server, lalu memperbarui status lokal kamar seketika dan memunculkan toast hijau. Pengguna tidak perlu me-reload halaman.

### E. Logika Global Toast Notification
- Dikelola oleh composable `app/composables/useToast.ts` menggunakan state Vue reaktif yang diinjeksikan ke `app/app.vue`.
- Komponen `ToastNotification.vue` memunculkan bubble notifikasi dengan animasi transisi Tailwind dan timer auto-dismiss 3.5 detik.

---

## 8. Katalog Endpoint API

| Method | URL Endpoint | Akses | Deskripsi & Payload |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Publik | Login admin. Body: `{ email, password }` |
| `POST` | `/api/auth/logout` | Admin | Hapus sesi login (clear cookie) |
| `GET` | `/api/auth/me` | Admin | Cek profil admin yang sedang login |
| `GET` | `/api/public/rooms` | Publik | Mengambil semua daftar kamar beserta relasi foto |
| `GET` | `/api/public/rooms/:slug` | Publik | Mengambil detail 1 kamar berdasarkan slug |
| `GET` | `/api/public/settings` | Publik | Mengambil info profil kos, nama pemilik & nomor WA |
| `GET` | `/api/admin/rooms` | Admin | Mengambil data kamar lengkap & kalkulasi statistik |
| `POST` | `/api/admin/rooms` | Admin | Tambah kamar baru beserta array gambar |
| `PATCH` | `/api/admin/rooms/:id/status` | Admin | **Fast Toggle** status kamar (`AVAILABLE` / `RENTED`) |
| `PUT` | `/api/admin/rooms/:id` | Admin | Update informasi data kamar & daftar foto |
| `DELETE`| `/api/admin/rooms/:id` | Admin | Hapus kamar dari database (Cascade delete gambar) |
| `POST` | `/api/admin/upload` | Admin | Upload file gambar (Multipart Form-Data, max 5MB) |
| `PUT` | `/api/admin/settings` | Admin | Update profil kos & nomor tujuan WhatsApp |

---

## 9. Panduan Instalasi & Menjalankan Proyek

### Prasyarat Sistem
- **Node.js**: Versi 18.x atau lebih baru.
- **Database**: PostgreSQL (bisa menggunakan PostgreSQL lokal, Supabase, Neon, atau Docker).

### Langkah-Langkah:

1. **Clone & Install Dependensi**:
   ```bash
   npm install
   ```

2. **Konfigurasi Environment (`.env`)**:
   Salin file `.env.example` menjadi `.env`, lalu sesuaikan koneksi database Anda:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/evakos?schema=public"
   SESSION_SECRET="kunci-rahasia-super-aman-evakos-2026"
   ```

3. **Generate Prisma Client & Migrasi Database**:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Isi Data Awal (Seeding)**:
   Perintah ini akan membuat akun admin Villa, kontak default, dan 3 kamar contoh:
   ```bash
   npx tsx prisma/seed.ts
   ```

5. **Jalankan Server Development**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di:
   - **Katalog Publik**: [http://localhost:3000](http://localhost:3000)
   - **Panel Admin CMS**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

### Kredensial Default Admin:
- **Email**: `villa@evakos.com`
- **Password**: `admin123`
*(Kredensial dan nomor WhatsApp dapat diubah kapan saja melalui halaman Admin > Pengaturan).*
