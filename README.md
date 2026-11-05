# EvaKos - Katalog Promosi Kos & Panel Pemilik (CMS)

Aplikasi web promosi kos interaktif dan Content Management System (CMS) untuk pemilik kos (**Villa**), dibangun menggunakan **Nuxt 4**, **Tailwind CSS v4**, **Prisma 7 + PostgreSQL**, dan **Argon2**.

---

## 🌟 Fitur Utama

### 📱 Modul Publik (Calon Penyewa)
- **Katalog Kamar Interaktif**: Tampilan kartu kamar dengan status **Tersedia** (badge hijau) atau **Tersewa** (badge merah).
- **Filter Cepat**: Tab filter instan (*Semua Kamar*, *Tersedia*, *Tersewa*).
- **Galeri Foto Lightbox**: Buka galeri multi-foto langsung dari halaman utama.
- **Halaman Khusus Tiap Kamar (`/kamar/[slug]`)**: Link yang siap dibagikan ke calon penyewa.
- **Smart WhatsApp Generator**: Tombol chat otomatis membuka aplikasi WhatsApp dengan pesan terisi sesuai kamar yang dipilih.

### ⚙️ Modul Admin (Pemilik Kos - Villa)
- **Autentikasi Aman**: Login khusus dengan enkripsi **Argon2** dan session cookie.
- **Fast 1-Click Status Toggle**: Cukup 1 klik untuk mengubah status kamar menjadi Tersewa atau Tersedia.
- **Manajemen Kamar (CRUD)**: Tambah, edit, dan hapus data kamar beserta fasilitasnya.
- **Multi-Image File Uploader**: Unggah banyak foto langsung dari HP atau PC ke `/public/uploads/`.
- **Pengaturan Kontak**: Form untuk mengganti nomor WhatsApp penerima pesan.

---

## 🚀 Cara Menjalankan

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Konfigurasi Database
Buat file `.env` dan masukkan connection string PostgreSQL Anda:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/evakos?schema=public"
```

### 3. Generate & Migrasi Database
```bash
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

### 4. Jalankan Aplikasi
```bash
npm run dev
```

- **Halaman Publik**: [http://localhost:3000](http://localhost:3000)
- **Panel Admin**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
  - **Email**: `villa@evakos.com`
  - **Password**: `admin123`
