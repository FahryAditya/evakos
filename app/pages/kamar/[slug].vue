<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const { data: settingsRes } = await useFetch('/api/public/settings')
const setting = computed(() => settingsRes.value?.data || {
  kosName: 'EvaKos',
  ownerName: 'Villa',
  whatsapp: '6281234567890',
  address: 'Jl. Merpati No. 18, Pusat Kota',
  mapsUrl: 'https://maps.app.goo.gl/2qX2Vv2UZ4xkrpsv7',
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
  <div class="max-w-[1100px] mx-auto px-3.5 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 pb-24 sm:pb-8 animate-fade-up">
    <!-- Back to catalog button with arrow glide -->
    <div>
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-text-main transition-all duration-200 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-full border border-slate-200/80 shadow-xs group active:scale-95"
      >
        <Icon name="lucide:arrow-left" class="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
        <span>Kembali ke Semua Kamar</span>
      </NuxtLink>
    </div>

    <!-- Error State -->
    <div v-if="error || !room" class="text-center py-20 bg-white rounded-3xl sm:rounded-3.5xl border border-slate-100 p-8">
      <h2 class="text-lg font-bold text-text-main">Kamar Tidak Ditemukan</h2>
      <p class="text-xs text-text-muted mt-1">Kamar yang Anda cari mungkin telah dihapus atau tautan tidak valid.</p>
      <NuxtLink to="/" class="btn-spring mt-4 inline-block bg-brand-dark text-white text-xs font-bold px-5 py-2.5 rounded-xl">
        Lihat Kamar Lainnya
      </NuxtLink>
    </div>

    <!-- Room Detail Content -->
    <div v-else class="space-y-6 sm:space-y-8">
      <!-- Title & Price Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white rounded-3xl sm:rounded-3.5xl p-5 sm:p-8 border border-slate-100 shadow-sm card-interactive">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span
              :class="[
                'text-[10px] sm:text-xs font-extrabold px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5',
                room.status === 'AVAILABLE'
                  ? 'bg-status-green text-white'
                  : 'bg-status-red text-white'
              ]"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-white" :class="room.status === 'AVAILABLE' ? 'animate-pulse' : ''"></span>
              {{ room.status === 'AVAILABLE' ? 'Tersedia untuk Disewa' : 'Tersewa / Penuh' }}
            </span>
            <span class="text-xs text-text-muted font-medium">&bull; {{ setting.kosName }}</span>
          </div>
          <h1 class="text-xl sm:text-3xl font-extrabold text-text-main tracking-tight">{{ room.name }}</h1>
          <a
            :href="setting.mapsUrl || 'https://maps.app.goo.gl/2qX2Vv2UZ4xkrpsv7'"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main font-semibold mt-1.5 transition-colors group"
          >
            <Icon name="lucide:map-pin" class="w-3.5 h-3.5 text-brand-dark group-hover:scale-110 transition-transform" />
            <span>{{ setting.address || 'Pusat Kota' }} &bull; Buka di Google Maps &rarr;</span>
          </a>
        </div>

        <div class="sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <p class="text-[11px] sm:text-xs text-text-muted font-medium">Harga Sewa Bulanan</p>
          <p class="text-2xl sm:text-3xl font-extrabold text-brand-dark mt-0.5">
            {{ formatRupiah(room.price) }}
            <span class="text-xs font-normal text-text-muted">/ bulan</span>
          </p>
        </div>
      </div>

      <!-- Main Photo Gallery -->
      <div class="bg-white rounded-3xl sm:rounded-3.5xl p-3.5 sm:p-6 border border-slate-100 shadow-sm space-y-3 sm:space-y-4">
        <!-- Main Big Image Preview with Smooth Crossfade -->
        <div class="w-full aspect-[4/3] sm:aspect-video rounded-2xl sm:rounded-2.5xl overflow-hidden bg-slate-100 shadow-inner relative group">
          <img
            :key="activePhotoIndex"
            :src="room.images?.[activePhotoIndex]?.url || room.images?.[0]?.url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200'"
            :alt="room.name"
            class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-[var(--ease-smooth)]"
          />
        </div>

        <!-- Thumbnails Gallery -->
        <div v-if="room.images && room.images.length > 1" class="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar">
          <button
            v-for="(img, idx) in room.images"
            :key="img.id || idx"
            @click="activePhotoIndex = Number(idx)"
            :class="[
              'w-20 sm:w-28 h-14 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all duration-300 ease-[var(--ease-spring)] cursor-pointer',
              activePhotoIndex === Number(idx) ? 'border-brand-yellow scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-102'
            ]"
          >
            <img :src="img.url" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Two-Column Information & CTA -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <!-- Left: Description & Facilities (2 cols) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Facilities Card -->
          <div class="bg-white rounded-3xl sm:rounded-3.5xl p-5 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <h2 class="text-base font-bold text-text-main border-b border-slate-100 pb-3">Fasilitas Kamar Ini</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div
                v-for="fac in room.facilities"
                :key="fac"
                class="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100 transition-colors"
              >
                <div class="w-6 h-6 rounded-lg bg-amber-50 text-brand-dark flex items-center justify-center flex-shrink-0">
                  <Icon name="lucide:check" class="w-3.5 h-3.5 text-status-green" />
                </div>
                <span class="text-xs font-semibold text-text-main line-clamp-1">{{ fac }}</span>
              </div>
            </div>
          </div>

          <!-- Description Card -->
          <div class="bg-white rounded-3xl sm:rounded-3.5xl p-5 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <h2 class="text-base font-bold text-text-main border-b border-slate-100 pb-3">Deskripsi Lengkap</h2>
            <p class="text-xs sm:text-sm text-text-main/80 leading-relaxed whitespace-pre-line">
              {{ room.description || 'Tidak ada catatan deskripsi tambahan untuk kamar ini.' }}
            </p>
          </div>
        </div>

        <!-- Right: Desktop Booking / WhatsApp Card (Hidden on mobile, replaced by sticky bottom bar) -->
        <div class="hidden lg:block space-y-6">
          <div class="bg-brand-dark text-white rounded-3.5xl p-6 sm:p-7 shadow-2xl space-y-5 sticky top-24 card-interactive">
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
              class="btn-spring w-full bg-brand-yellow hover:bg-brand-yellow-hover text-brand-dark text-xs sm:text-sm font-extrabold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg min-h-[44px]"
            >
              <Icon name="lucide:message-circle" class="w-5 h-5 text-brand-dark" />
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

    <!-- ============================================== -->
    <!-- STICKY MOBILE BOTTOM BAR FOR INSTANT BOOKING   -->
    <!-- ============================================== -->
    <div class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 flex items-center justify-between gap-3 shadow-2xl safe-area-inset-bottom animate-fade-up">
      <div>
        <span class="text-[10px] text-text-muted font-bold block uppercase">Harga Sewa</span>
        <p class="text-base font-extrabold text-brand-dark leading-tight">
          {{ room ? formatRupiah(room.price) : 'Rp 0' }}
          <span class="text-[10px] font-normal text-text-muted">/ bln</span>
        </p>
      </div>

      <a
        :href="waLink"
        target="_blank"
        rel="noopener noreferrer"
        class="btn-spring bg-brand-yellow hover:bg-brand-yellow-hover text-brand-dark text-xs font-extrabold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-sm flex-shrink-0 min-h-[42px] pulse-ring-yellow"
      >
        <Icon name="lucide:message-circle" class="w-4 h-4 text-brand-dark" />
        <span>Chat WhatsApp</span>
      </a>
    </div>

  </div>
</template>
