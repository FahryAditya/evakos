# 📋 Master Development Plan - EvaKos: Katalog Promosi Kos & CMS Pemilik

Membangun web aplikasi promosi kos interaktif (sisi publik) dan sistem manajemen konten (CMS sisi pemilik kos - Villa) berbasis **Nuxt 4**, **Tailwind CSS v4**, **Prisma 7 + PostgreSQL**, dan **Argon2**, dengan mengadopsi panduan desain dari [acuan Visual/index.html](file:///c:/Users/ACER/Documents/evakos/acuan%20Visual/index.html).

---

## 1. User Review Required

> [!IMPORTANT]
> **Koneksi Database PostgreSQL**:
> File `.env` saat ini masih berisi template (`DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DBNAME?schema=public"`). Mohon siapkan URL database PostgreSQL aktif (bisa lokal Postgres, Supabase, Neon, atau Railway) agar migrasi Prisma dapat dijalankan.

> [!NOTE]
> **Strategi Penyimpanan Gambar**:
> Secara default, sistem akan menyimpan file upload gambar kamar langsung ke folder lokal `/public/uploads/` dengan optimasi penamaan unik. Arsitektur dibuat modular sehingga dapat dialihkan ke Cloudinary / Supabase Storage jika dibutuhkan di masa mendatang.

---

## 2. Open Questions & Asumsi Awal

1. **Kredensial Default Admin Villa**:
   - **Email**: `villa@evakos.com`
   - **Password**: `admin123` (di-hash dengan Argon2)
2. **Nomor WhatsApp Awal**:
   - `6281234567890` (dapat diubah kapan saja melalui halaman Pengaturan di dashboard admin).

---

## 3. Diagram Arsitektur & Alur Kerja

```mermaid
graph TD
    subgraph Client Layer
        Pub[Public Visitor: Katalog & Detail Kos]
        Adm[Admin Villa: Dashboard & CMS]
    end

    subgraph Nuxt 4 Frontend
        LayoutPub[Default Layout: Hero + Filter + Grid + WA CTA]
        LayoutAdm[Admin Layout: 3-Col Sidebar + Content + Profile]
        Toast[Toast Notification Component]
    end

    subgraph Nitro Server Layer
        AuthMid[Auth Middleware: /api/admin/*]
        AuthAPI[API Auth: Login, Logout, Me]
        PublicAPI[API Public: Rooms, Settings]
        AdminAPI[API Admin: Rooms CRUD, Status Toggle, Upload, Settings]
    end

    subgraph Persistence Layer
        Prisma[Prisma 7 ORM Adapter PG]
        DB[(PostgreSQL)]
        Uploads[Local /public/uploads/ Disk]
    end

    Pub --> LayoutPub --> PublicAPI --> Prisma --> DB
    Adm --> LayoutAdm --> AuthMid --> AdminAPI --> Prisma --> DB
    AdminAPI --> Uploads
```

---

## 4. Daftar Rencana Perubahan (Proposed Changes)

### A. Database & Prisma
- `[MODIFY]` [prisma/schema.prisma](file:///c:/Users/ACER/Documents/evakos/prisma/schema.prisma):
  - Model `User` (Admin login).
  - Model `Room` (Nama, slug, harga, fasilitas array, status `AVAILABLE`/`RENTED`, urutan).
  - Model `RoomImage` (Galeri foto tiap kamar dengan flag `isPrimary`).
  - Model `Setting` (Nomor WhatsApp pemilik, nama kos, alamat, maps).
- `[NEW]` `prisma/seed.ts`:
  - Seeding otomatis akun admin Villa, kontak default, dan 3 sampel data kamar.

### B. Backend Server & APIs (`server/`)
- `[NEW]` `server/utils/auth.ts`: Helper session cookie & HMAC token sign/verify.
- `[NEW]` `server/middleware/auth.ts`: Middleware pelindung semua route `/api/admin/**`.
- `[NEW]` `server/api/auth/login.post.ts`: Autentikasi email & password dengan Argon2.
- `[NEW]` `server/api/auth/logout.post.ts` & `me.get.ts`: Pengelolaan sesi.
- `[NEW]` `server/api/public/rooms/index.get.ts` & `[slug].get.ts`: Pengambilan katalog kamar untuk publik.
- `[NEW]` `server/api/public/settings.get.ts`: Pengambilan kontak WA dan profil kos.
- `[NEW]` `server/api/admin/rooms/index.get.ts` & `index.post.ts`: List & Tambah kamar.
- `[NEW]` `server/api/admin/rooms/[id]/status.patch.ts`: **Fast Toggle Status 1-Klik** (`AVAILABLE` <-> `RENTED`).
- `[NEW]` `server/api/admin/rooms/[id].put.ts` & `[id].delete.ts`: Edit dan hapus kamar.
- `[NEW]` `server/api/admin/upload.post.ts`: Handler upload multi-gambar ke `/public/uploads/`.
- `[NEW]` `server/api/admin/settings.put.ts`: Update nomor WA & data profil kos.

### C. Desain Visual & Styling (`app/assets/css/main.css`)
- `[MODIFY]` [main.css](file:///c:/Users/ACER/Documents/evakos/app/assets/css/main.css):
  - Font: **Plus Jakarta Sans**
  - Warna: Canvas (`#F1F3F6`), Dark Navy (`#1A1B2F`), Kuning (`#FFD643`), Status Hijau (`#49B86E`), Status Merah (`#EB5757`).
  - Border radius: `rounded-2.5xl` (20px), `rounded-3.5xl` (28px).

### D. Halaman & Layout (`app/`)
- `[MODIFY]` [app.vue](file:///c:/Users/ACER/Documents/evakos/app/app.vue): `<NuxtLayout><NuxtPage /></NuxtLayout>` + Global Toast.
- `[NEW]` `app/layouts/default.vue`: Layout publik responsif mobile.
- `[NEW]` `app/layouts/admin.vue`: Layout 3-kolom modern mengadopsi acuan visual.
- `[NEW]` `app/pages/index.vue`: Katalog publik, hero, sub-tabs filter, grid kartu kamar, smart WhatsApp link.
- `[NEW]` `app/pages/kamar/[slug].vue`: Detail kamar lengkap & galeri foto.
- `[NEW]` `app/pages/admin/login.vue`: Halaman login pemilik kos.
- `[NEW]` `app/pages/admin/index.vue`: Dashboard admin, statistik kamar, dan fast toggle status 1-klik.
- `[NEW]` `app/pages/admin/kamar/tambah.vue` & `[id]/edit.vue`: Form input & multi-upload foto.
- `[NEW]` `app/pages/admin/pengaturan.vue`: Form edit nomor WhatsApp dan info kos.
- `[NEW]` `app/components/ToastNotification.vue`: Komponen notifikasi mengambang.

---

## 5. Rencana Pengujian (Verification Plan)

1. **Automated Verification**:
   - `npx prisma generate` memastikan type-safety client Prisma.
   - `npm run build` memastikan integritas bundle Nuxt tanpa kesalahan sintaks TypeScript.
2. **Manual Verification**:
   - Uji login admin dan proteksi middleware.
   - Uji toggle 1-klik status kamar dari dashboard admin dan verifikasi perubahan badge di halaman publik.
   - Uji klik tombol WhatsApp dan validasi nomor tujuan serta draft pesan otomatis.
   - Uji unggah foto dan galeri gambar.
