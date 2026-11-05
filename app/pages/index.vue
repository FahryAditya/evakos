<script setup lang="ts">
const { data: settingsRes } = await useFetch('/api/public/settings')
const setting = computed(() => settingsRes.value?.data || {
  kosName: 'EvaKos',
  ownerName: 'Villa',
  whatsapp: '6281234567890',
  address: 'Jl. Merpati No. 18, Pusat Kota',
})

const { data: roomsRes, pending } = await useFetch('/api/public/rooms')
const rooms = computed(() => roomsRes.value?.data || [])

const searchQuery = ref('')
const activeFilter = ref<'all' | 'AVAILABLE' | 'RENTED'>('all')

// Selected room for quick photo modal/lightbox
const activeModalRoom = ref<any>(null)
const activePhotoIndex = ref(0)

const openModal = (room: any) => {
  activeModalRoom.value = room
  activePhotoIndex.value = 0
}

const closeModal = () => {
  activeModalRoom.value = null
}

const filteredRooms = computed(() => {
  return rooms.value.filter((room: any) => {
    const matchQuery = room.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    if (!matchQuery) return false
    if (activeFilter.value === 'all') return true
    return room.status === activeFilter.value
  })
})

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

const getWhatsAppRoomLink = (room: any) => {
  const message = `Halo kak ${setting.value.ownerName}, saya lihat dari website tertarik dengan ${room.name} (Rp ${room.price.toLocaleString('id-ID')}/bulan). Apakah kamar ini masih tersedia?`
  return `https://wa.me/${setting.value.whatsapp}?text=${encodeURIComponent(message)}`
}
</script>

<template>
  <div class="max-w-[1360px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10 sm:space-y-12">
    
    <!-- ============================================== -->
    <!-- 1. HERO BANNER                                 -->
    <!-- ============================================== -->
    <section class="bg-brand-dark text-white rounded-[32px] p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
      <!-- Background subtle glow -->
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-brand-yellow/15 rounded-full blur-3xl pointer-events-none"></div>

      <div class="max-w-xl space-y-4 text-center lg:text-left relative z-10">
        <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-brand-yellow">
          <span class="w-2 h-2 rounded-full bg-brand-yellow animate-pulse"></span>
          <span>Kamar Kos Nyaman &bull; Dikelola Langsung</span>
        </div>

        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
          Cari Kamar Kos Impian di <span class="text-brand-yellow">{{ setting.kosName }}</span>
        </h1>

        <p class="text-slate-300 text-xs sm:text-sm leading-relaxed">
          Temukan pilihan kamar bersih, aman, fasilitas lengkap, dan terjangkau. Pilih kamar yang cocok dan langsung hubungi pemilik via WhatsApp tanpa perantara.
        </p>

        <!-- Quick Stats Banner -->
        <div class="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold">
          <div class="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl">
            <Icon name="lucide:map-pin" class="w-4 h-4 text-brand-yellow" />
            <span>{{ setting.address || 'Pusat Kota' }}</span>
          </div>
          <div class="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-xl">
            <Icon name="lucide:user-check" class="w-4 h-4 text-status-green" />
            <span>Pemilik: kak {{ setting.ownerName }}</span>
          </div>
        </div>
      </div>

      <!-- Hero Visual Accent (Adapted from acuan Visual Card) -->
      <div class="w-full lg:w-96 bg-white text-text-main rounded-2.5xl p-5 shadow-2xl relative z-10 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-text-muted uppercase tracking-wider">Fast Contact</span>
          <span class="inline-flex items-center gap-1 text-[11px] font-bold text-status-green bg-emerald-50 px-2 py-0.5 rounded-full">
            <span class="w-1.5 h-1.5 rounded-full bg-status-green"></span>
            Respon Cepat
          </span>
        </div>
        <p class="text-xs font-medium text-text-muted leading-relaxed">
          Punya pertanyaan seputar ketersediaan kamar, survey lokasi, atau pembayaran sewa?
        </p>
        <a
          :href="`https://wa.me/${setting.whatsapp}?text=${encodeURIComponent('Halo kak ' + setting.ownerName + ', saya ingin survey lokasi kos.')}`"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full bg-brand-yellow hover:bg-brand-yellow-hover text-brand-dark text-xs font-bold py-3 rounded-xl transition-ui flex items-center justify-center gap-2 shadow-sm active:scale-95"
        >
          <Icon name="lucide:message-circle" class="w-4 h-4" />
          <span>Chat Pemilik via WhatsApp</span>
        </a>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 2. KATALOG & FILTER KAMAR                      -->
    <!-- ============================================== -->
    <section class="space-y-6">
      <!-- Section Title & Search -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-text-main tracking-tight">Pilihan Kamar Tersedia</h2>
          <p class="text-xs text-text-muted mt-0.5">Pilih kamar yang sesuai dengan kebutuhan dan budget Anda</p>
        </div>

        <!-- Search Input Bar -->
        <div class="relative w-full sm:w-72">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari kamar (contoh: AC, Deluxe)..."
            class="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-slate-200 bg-white placeholder-slate-400 text-text-main focus:outline-none focus:border-brand-yellow focus:ring-2 focus:ring-yellow-100 transition-ui"
          />
          <Icon name="lucide:search" class="w-3.5 h-3.5 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <!-- Filter Sub-tabs (From Visual Reference) -->
      <div class="flex items-center gap-6 text-xs border-b border-slate-200/80 pb-2">
        <button
          @click="activeFilter = 'all'"
          :class="[
            'pb-2 transition-ui text-xs',
            activeFilter === 'all'
              ? 'font-bold text-text-main border-b-2 border-text-main'
              : 'font-medium text-text-muted hover:text-text-main'
          ]"
        >
          Semua Kamar ({{ rooms.length }})
        </button>
        <button
          @click="activeFilter = 'AVAILABLE'"
          :class="[
            'pb-2 transition-ui text-xs',
            activeFilter === 'AVAILABLE'
              ? 'font-bold text-text-main border-b-2 border-text-main'
              : 'font-medium text-text-muted hover:text-text-main'
          ]"
        >
          Kamar Kosong / Tersedia ({{ rooms.filter((r: any) => r.status === 'AVAILABLE').length }})
        </button>
        <button
          @click="activeFilter = 'RENTED'"
          :class="[
            'pb-2 transition-ui text-xs',
            activeFilter === 'RENTED'
              ? 'font-bold text-text-main border-b-2 border-text-main'
              : 'font-medium text-text-muted hover:text-text-main'
          ]"
        >
          Tersewa / Penuh ({{ rooms.filter((r: any) => r.status === 'RENTED').length }})
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="filteredRooms.length === 0" class="text-center py-20 bg-white rounded-2.5xl border border-slate-100 p-8">
        <div class="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-text-muted text-2xl">
          🏠
        </div>
        <h3 class="text-base font-bold text-text-main">Tidak ada kamar ditemukan</h3>
        <p class="text-xs text-text-muted mt-1">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
      </div>

      <!-- Room Cards Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <article
          v-for="room in filteredRooms"
          :key="room.id"
          class="bg-white rounded-2.5xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-ui flex flex-col justify-between"
        >
          <div>
            <!-- Image & Badges -->
            <div
              @click="openModal(room)"
              class="relative w-full h-52 rounded-2xl overflow-hidden bg-slate-100 cursor-pointer group mb-4"
            >
              <img
                :src="room.images?.[0]?.url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'"
                :alt="room.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-ui duration-500"
              />

              <!-- Overlay Hover Prompt -->
              <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-ui flex items-center justify-center">
                <span class="bg-white/90 text-brand-dark text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                  <Icon name="lucide:maximize-2" class="w-3.5 h-3.5" />
                  Lihat {{ room.images?.length || 1 }} Foto
                </span>
              </div>

              <!-- Status Badge (Hijau = Tersedia / Merah = Tersewa) -->
              <div class="absolute top-3 right-3">
                <span
                  :class="[
                    'text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5',
                    room.status === 'AVAILABLE'
                      ? 'bg-status-green text-white'
                      : 'bg-status-red text-white'
                  ]"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                  {{ room.status === 'AVAILABLE' ? 'Tersedia' : 'Tersewa / Penuh' }}
                </span>
              </div>

              <!-- Photo Count -->
              <div class="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Icon name="lucide:camera" class="w-3 h-3" />
                <span>{{ room.images?.length || 0 }} Foto</span>
              </div>
            </div>

            <!-- Title & Price -->
            <div class="mb-3">
              <h3 class="font-extrabold text-base text-text-main line-clamp-1">{{ room.name }}</h3>
              <p class="text-sm font-extrabold text-brand-dark mt-1">
                {{ formatRupiah(room.price) }}
                <span class="text-xs font-normal text-text-muted">/ bulan</span>
              </p>
            </div>

            <!-- Description -->
            <p v-if="room.description" class="text-xs text-text-muted leading-relaxed line-clamp-2 mb-4">
              {{ room.description }}
            </p>

            <!-- Facilities tags -->
            <div class="flex flex-wrap gap-1.5 mb-5">
              <span
                v-for="fac in room.facilities.slice(0, 4)"
                :key="fac"
                class="text-[11px] font-medium bg-slate-50 border border-slate-100 text-text-main px-2.5 py-1 rounded-lg flex items-center gap-1"
              >
                <Icon name="lucide:check" class="w-3 h-3 text-status-green" />
                {{ fac }}
              </span>
              <span v-if="room.facilities.length > 4" class="text-[10px] text-text-muted font-medium self-center">
                +{{ room.facilities.length - 4 }} lainnya
              </span>
            </div>
          </div>

          <!-- Bottom Action Buttons: Direct WhatsApp CTA -->
          <div class="pt-3 border-t border-slate-100 space-y-2">
            <!-- If Available: Big WA Button -->
            <a
              v-if="room.status === 'AVAILABLE'"
              :href="getWhatsAppRoomLink(room)"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full bg-brand-yellow hover:bg-brand-yellow-hover text-brand-dark text-xs font-bold py-2.5 rounded-xl transition-ui flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <Icon name="lucide:message-circle" class="w-4 h-4" />
              <span>Tanya Kamar Ini via WA</span>
            </a>

            <!-- If Rented: Inactive / Ask Waitlist -->
            <a
              v-else
              :href="`https://wa.me/${setting.whatsapp}?text=${encodeURIComponent('Halo kak ' + setting.ownerName + ', apakah kamar ' + room.name + ' ada antrian jika nanti kosong?')}`"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full bg-slate-100 hover:bg-slate-200 text-text-muted text-xs font-bold py-2.5 rounded-xl transition-ui flex items-center justify-center gap-2 active:scale-95"
            >
              <Icon name="lucide:bell" class="w-4 h-4" />
              <span>Kamar Tersewa (Kabari Jika Kosong)</span>
            </a>

            <!-- Detail link -->
            <NuxtLink
              :to="`/kamar/${room.slug}`"
              class="block text-center text-xs text-text-muted hover:text-text-main font-semibold py-1 transition-ui"
            >
              Lihat Detail Lengkap &rarr;
            </NuxtLink>
          </div>
        </article>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 3. HIGHLIGHT FEATURE CARDS (From Visual Design)-->
    <!-- ============================================== -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
      <!-- Dark Navy Contrast Card -->
      <article class="bg-brand-dark text-white rounded-3.5xl p-6 sm:p-8 shadow-card flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-brand-yellow uppercase tracking-wider">Keamanan &amp; Kenyamanan</span>
            <Icon name="lucide:shield-check" class="w-5 h-5 text-brand-yellow" />
          </div>
          <h3 class="text-xl font-bold tracking-tight mb-2">Hunian Aman, Bersih, dan Tenang</h3>
          <p class="text-xs text-slate-300 leading-relaxed mb-6">
            Setiap kamar dirawat secara berkala untuk menjaga kebersihan dan kenyamanan penghuni. Lingkungan aman dan ramah untuk belajar maupun beristirahat setelah beraktivitas.
          </p>
        </div>
        <div class="pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
          <span>Akses 24 Jam &bull; Kunci Gerbang Mandiri</span>
          <span class="text-white font-bold">{{ setting.kosName }}</span>
        </div>
      </article>

      <!-- Yellow Contrast Card -->
      <article class="bg-brand-yellow text-brand-dark rounded-3.5xl p-6 sm:p-8 shadow-card flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-extrabold uppercase tracking-wider text-brand-dark/70">Langsung ke Pemilik</span>
            <Icon name="lucide:badge-percent" class="w-5 h-5 text-brand-dark" />
          </div>
          <h3 class="text-xl font-extrabold tracking-tight mb-2">Tanpa Biaya Admin &amp; Perantara</h3>
          <p class="text-xs text-brand-dark/85 font-medium leading-relaxed mb-6">
            Komunikasi dan transaksi sewa kamar dilakukan langsung dengan kak {{ setting.ownerName }}. Dapatkan informasi harga paling transparan dan fleksibilitas jadwal survey.
          </p>
        </div>
        <div class="pt-4 border-t border-brand-dark/15 flex items-center justify-between text-xs font-bold text-brand-dark">
          <span>Respon Cepat via WhatsApp</span>
          <a :href="`https://wa.me/${setting.whatsapp}`" target="_blank" class="underline">
            {{ setting.whatsapp }}
          </a>
        </div>
      </article>
    </section>

    <!-- ============================================== -->
    <!-- 4. MODAL / LIGHTBOX GALERI FOTO                -->
    <!-- ============================================== -->
    <Teleport to="body">
      <div
        v-if="activeModalRoom"
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-3.5xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <!-- Modal Header -->
          <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 class="font-bold text-base text-text-main">{{ activeModalRoom.name }}</h3>
              <p class="text-xs text-text-muted">{{ formatRupiah(activeModalRoom.price) }} / bulan</p>
            </div>
            <button
              @click="closeModal"
              class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-text-main flex items-center justify-center transition-ui"
            >
              <Icon name="lucide:x" class="w-4 h-4" />
            </button>
          </div>

          <!-- Active Photo Preview -->
          <div class="p-4 sm:p-6 overflow-y-auto space-y-4">
            <div class="w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 relative shadow-inner">
              <img
                :src="activeModalRoom.images?.[activePhotoIndex]?.url || activeModalRoom.images?.[0]?.url"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Thumbnail Carousel -->
            <div v-if="activeModalRoom.images?.length > 1" class="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <button
                v-for="(img, idx) in activeModalRoom.images"
                :key="img.id || idx"
                @click="activePhotoIndex = Number(idx)"
                :class="[
                  'w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-ui',
                  activePhotoIndex === Number(idx) ? 'border-brand-yellow scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                ]"
              >
                <img :src="img.url" class="w-full h-full object-cover" />
              </button>
            </div>

            <!-- Detail Facilities in Modal -->
            <div class="pt-2">
              <h4 class="text-xs font-bold text-text-main mb-2">Fasilitas Kamar:</h4>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="fac in activeModalRoom.facilities"
                  :key="fac"
                  class="text-xs bg-slate-100 text-text-main px-3 py-1 rounded-full font-medium"
                >
                  {{ fac }}
                </span>
              </div>
            </div>
          </div>

          <!-- Modal Footer CTA -->
          <div class="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
            <NuxtLink
              :to="`/kamar/${activeModalRoom.slug}`"
              class="text-xs font-bold text-text-muted hover:text-text-main"
            >
              Buka Halaman Detail Penuh
            </NuxtLink>
            <a
              :href="getWhatsAppRoomLink(activeModalRoom)"
              target="_blank"
              rel="noopener noreferrer"
              class="bg-brand-dark hover:bg-brand-dark-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-ui flex items-center gap-2 active:scale-95 shadow-sm"
            >
              <Icon name="lucide:message-circle" class="w-4 h-4 text-brand-yellow" />
              <span>Hubungi via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

