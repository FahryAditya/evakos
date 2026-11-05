<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { data: settingsRes } = await useFetch('/api/public/settings')
const setting = computed(() => settingsRes.value?.data || {
  kosName: 'EvaKos',
  ownerName: 'Villa',
  whatsapp: '6281234567890',
  address: 'Jl. Merpati No. 18, Pusat Kota',
})

const { data: roomRes, error } = await useFetch(`/api/public/rooms/${slug}`)
const room = computed(() => roomRes.value?.data)

const activePhotoIndex = ref(0)

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

const waLink = computed(() => {
  if (!room.value) return '#'
  const message = `Halo kak ${setting.value.ownerName}, saya tertarik dengan ${room.value.name} (Rp ${room.value.price.toLocaleString('id-ID')}/bulan) di ${setting.value.kosName}. Apakah kamar ini masih tersedia?`
  return `https://wa.me/${setting.value.whatsapp}?text=${encodeURIComponent(message)}`
})
</script>

<template>
  <div class="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
    <!-- Back to catalog button -->
    <div>
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-text-main transition-ui bg-white px-4 py-2 rounded-full border border-slate-200/80 shadow-sm"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4" />
        <span>Kembali ke Semua Pilihan Kamar</span>
      </NuxtLink>
    </div>

    <!-- Error State -->
    <div v-if="error || !room" class="text-center py-20 bg-white rounded-3.5xl border border-slate-100 p-8">
      <h2 class="text-lg font-bold text-text-main">Kamar Tidak Ditemukan</h2>
      <p class="text-xs text-text-muted mt-1">Kamar yang Anda cari mungkin telah dihapus atau tautan tidak valid.</p>
      <NuxtLink to="/" class="mt-4 inline-block bg-brand-dark text-white text-xs font-bold px-5 py-2.5 rounded-xl">
        Lihat Kamar Lainnya
      </NuxtLink>
    </div>

    <!-- Room Detail Content -->
    <div v-else class="space-y-8">
      <!-- Title & Price Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3.5xl p-6 sm:p-8 border border-slate-100 shadow-sm">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span
              :class="[
                'text-xs font-extrabold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5',
                room.status === 'AVAILABLE'
                  ? 'bg-status-green text-white'
                  : 'bg-status-red text-white'
              ]"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
              {{ room.status === 'AVAILABLE' ? 'Tersedia untuk Disewa' : 'Tersewa / Penuh' }}
            </span>
            <span class="text-xs text-text-muted font-medium">&bull; {{ setting.kosName }}</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">{{ room.name }}</h1>
        </div>

        <div class="sm:text-right">
          <p class="text-xs text-text-muted font-medium">Harga Sewa Bulanan</p>
          <p class="text-2xl sm:text-3xl font-extrabold text-brand-dark mt-0.5">
            {{ formatRupiah(room.price) }}
            <span class="text-xs font-normal text-text-muted">/ bulan</span>
          </p>
        </div>
      </div>

      <!-- Main Photo Gallery -->
      <div class="bg-white rounded-3.5xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-4">
        <!-- Main Big Image Preview -->
        <div class="w-full aspect-video rounded-2.5xl overflow-hidden bg-slate-100 shadow-inner">
          <img
            :src="room.images?.[activePhotoIndex]?.url || room.images?.[0]?.url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200'"
            :alt="room.name"
            class="w-full h-full object-cover transition-ui"
          />
        </div>

        <!-- Thumbnails Gallery -->
        <div v-if="room.images && room.images.length > 1" class="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          <button
            v-for="(img, idx) in room.images"
            :key="img.id || idx"
            @click="activePhotoIndex = Number(idx)"
            :class="[
              'w-24 sm:w-28 h-16 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-ui',
              activePhotoIndex === Number(idx) ? 'border-brand-yellow scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
            ]"
          >
            <img :src="img.url" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Two-Column Information & CTA -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left: Description & Facilities (2 cols) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Facilities Card -->
          <div class="bg-white rounded-3.5xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <h2 class="text-base font-bold text-text-main border-b border-slate-100 pb-3">Fasilitas Kamar Ini</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div
                v-for="fac in room.facilities"
                :key="fac"
                class="flex items-center gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100"
              >
                <div class="w-6 h-6 rounded-lg bg-amber-50 text-brand-dark flex items-center justify-center flex-shrink-0">
                  <Icon name="lucide:check" class="w-3.5 h-3.5 text-status-green" />
                </div>
                <span class="text-xs font-semibold text-text-main">{{ fac }}</span>
              </div>
            </div>
          </div>

          <!-- Description Card -->
          <div class="bg-white rounded-3.5xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <h2 class="text-base font-bold text-text-main border-b border-slate-100 pb-3">Deskripsi Lengkap</h2>
            <p class="text-xs sm:text-sm text-text-main/80 leading-relaxed whitespace-pre-line">
              {{ room.description || 'Tidak ada catatan deskripsi tambahan untuk kamar ini.' }}
            </p>
          </div>
        </div>

        <!-- Right: Booking / WhatsApp Card (1 col) -->
        <div class="space-y-6">
          <div class="bg-brand-dark text-white rounded-3.5xl p-6 sm:p-7 shadow-2xl space-y-5 sticky top-24">
            <div>
              <span class="text-xs font-bold text-brand-yellow uppercase tracking-wider">Pemesanan &amp; Survey</span>
              <h3 class="text-lg font-bold mt-1">Tertarik dengan kamar ini?</h3>
              <p class="text-xs text-slate-300 mt-1 leading-relaxed">
                Tanyakan langsung ketersediaan atau jadwalkan survey dengan kak {{ setting.ownerName }}.
              </p>
            </div>

            <!-- Price Recap -->
            <div class="bg-white/10 rounded-2xl p-4 border border-white/10 space-y-1">
              <span class="text-[11px] text-slate-400">Total Biaya Sewa:</span>
              <p class="text-xl font-extrabold text-white">
                {{ formatRupiah(room.price) }}
                <span class="text-xs font-normal text-slate-300">/ bulan</span>
              </p>
            </div>

            <!-- Main WhatsApp Button -->
            <a
              :href="waLink"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full bg-brand-yellow hover:bg-brand-yellow-hover text-brand-dark text-xs font-extrabold py-3.5 px-4 rounded-2xl transition-ui flex items-center justify-center gap-2.5 shadow-lg active:scale-95"
            >
              <Icon name="lucide:message-circle" class="w-5 h-5" />
              <span>Chat via WhatsApp Sekarang</span>
            </a>

            <!-- Quick notes -->
            <div class="pt-3 border-t border-slate-700/60 space-y-2 text-[11px] text-slate-400">
              <div class="flex items-center gap-2">
                <Icon name="lucide:check-circle" class="w-3.5 h-3.5 text-status-green flex-shrink-0" />
                <span>Tanpa uang muka untuk survey</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon name="lucide:check-circle" class="w-3.5 h-3.5 text-status-green flex-shrink-0" />
                <span>Terhubung langsung ke nomor pemilik</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

