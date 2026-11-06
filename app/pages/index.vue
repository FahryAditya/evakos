<script setup lang="ts">
const { data: settingsRes } = await useFetch('/api/public/settings')
const setting = computed(() => settingsRes.value?.data || {
  kosName: 'EvaKos',
  ownerName: 'Villa',
  whatsapp: '6281234567890',
  address: 'Jl. Merpati No. 18, Pusat Kota',
  mapsUrl: 'https://maps.app.goo.gl/2qX2Vv2UZ4xkrpsv7',
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
  <div class="max-w-[1360px] mx-auto px-3.5 sm:px-6 py-4 sm:py-8 space-y-8 sm:space-y-12">
    
    <!-- ============================================== -->
    <!-- 1. HERO BANNER                                 -->
    <!-- ============================================== -->
    <section class="bg-brand-dark text-white rounded-3xl sm:rounded-[32px] p-5 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 animate-fade-up">
      <!-- Background interactive glowing orb -->
      <div class="absolute -top-24 -right-24 w-72 sm:w-96 h-72 sm:h-96 bg-brand-yellow/15 rounded-full blur-3xl pointer-events-none animate-pulse" style="animation-duration: 4s;"></div>
      <div class="absolute -bottom-24 -left-24 w-72 sm:w-96 h-72 sm:h-96 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="max-w-xl space-y-3.5 sm:space-y-4 text-center lg:text-left relative z-10">
        <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full text-[11px] font-semibold text-brand-yellow hover:bg-white/15 transition-all duration-300">
          <span class="w-2 h-2 rounded-full bg-brand-yellow animate-ping"></span>
          <span>Kamar Kos Nyaman &bull; Dikelola Langsung</span>
        </div>

        <h1 class="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
          Cari Kamar Kos Impian di <span class="text-brand-yellow drop-shadow-sm">{{ setting.kosName }}</span>
        </h1>

        <p class="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto lg:mx-0">
          Temukan pilihan kamar bersih, aman, fasilitas lengkap, dan terjangkau. Pilih kamar yang cocok dan langsung hubungi pemilik via WhatsApp tanpa perantara.
        </p>

        <!-- Quick Info Chips -->
        <div class="pt-1 sm:pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-4 text-xs font-semibold">
          <a
            :href="setting.mapsUrl || 'https://maps.app.goo.gl/2qX2Vv2UZ4xkrpsv7'"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 bg-white/10 hover:bg-white/20 hover:scale-102 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all duration-200 group active:scale-95 cursor-pointer"
            title="Buka Lokasi di Google Maps"
          >
            <Icon name="lucide:map-pin" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-yellow group-hover:scale-110 transition-transform" />
            <span class="text-[11px] sm:text-xs">{{ setting.address || 'Pusat Kota' }}</span>
            <Icon name="lucide:external-link" class="w-3 h-3 text-slate-300 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>
          <div class="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-colors">
            <Icon name="lucide:user-check" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-status-green" />
            <span class="text-[11px] sm:text-xs">Pemilik: kak {{ setting.ownerName }}</span>
          </div>
        </div>
      </div>

      <!-- Hero Fast Contact Card (Interactive Hover Lift) -->
      <div class="w-full lg:w-96 bg-white text-text-main rounded-2.5xl p-4 sm:p-5 shadow-2xl relative z-10 space-y-3 card-interactive">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-text-muted uppercase tracking-wider">Fast Contact</span>
          <span class="inline-flex items-center gap-1.5 text-[11px] font-bold text-status-green bg-emerald-50 px-2.5 py-0.5 rounded-full">
            <span class="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse"></span>
            Respon Cepat
          </span>
        </div>
        <p class="text-xs font-medium text-text-muted leading-relaxed">
          Punya pertanyaan seputar ketersediaan kamar, survey lokasi, atau sistem sewa?
        </p>
        <a
          :href="`https://wa.me/${setting.whatsapp}?text=${encodeURIComponent('Halo kak ' + setting.ownerName + ', saya ingin survey lokasi kos.')}`"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-spring w-full bg-brand-yellow hover:bg-brand-yellow-hover text-brand-dark text-xs sm:text-sm font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm min-h-[44px]"
        >
          <Icon name="lucide:message-circle" class="w-4 h-4 text-brand-dark" />
          <span>Chat Pemilik via WhatsApp</span>
        </a>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 2. KATALOG & FILTER KAMAR                      -->
    <!-- ============================================== -->
    <section class="space-y-5 sm:space-y-6">
      <!-- Section Title & Search -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 class="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">Pilihan Kamar Tersedia</h2>
          <p class="text-xs text-text-muted mt-0.5">Pilih kamar yang sesuai dengan kebutuhan dan budget Anda</p>
        </div>

        <!-- Search Input Bar with focus glow -->
        <div class="relative w-full sm:w-72">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari kamar (contoh: AC, Mandi Dalam)..."
            class="w-full pl-9 pr-4 py-2.5 sm:py-2 text-xs rounded-full border border-slate-200 bg-white placeholder-slate-400 text-text-main focus:outline-none focus:border-brand-yellow focus:ring-4 focus:ring-brand-yellow/20 transition-all duration-300"
          />
          <Icon name="lucide:search" class="w-3.5 h-3.5 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <!-- Filter Sub-tabs (Interactive Smooth Pill Buttons) -->
      <div class="flex items-center gap-2 sm:gap-3 text-xs border-b border-slate-200/80 pb-3 overflow-x-auto no-scrollbar whitespace-nowrap scroll-smooth">
        <button
          @click="activeFilter = 'all'"
          :class="[
            'tab-spring px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 cursor-pointer active:scale-95',
            activeFilter === 'all'
              ? 'bg-brand-dark text-white font-bold shadow-md scale-100'
              : 'bg-white text-text-muted hover:text-text-main hover:bg-slate-50 border border-slate-200'
          ]"
        >
          <span>Semua Kamar</span>
          <span class="text-[10px] opacity-75 font-normal">({{ rooms.length }})</span>
        </button>

        <button
          @click="activeFilter = 'AVAILABLE'"
          :class="[
            'tab-spring px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 cursor-pointer active:scale-95',
            activeFilter === 'AVAILABLE'
              ? 'bg-status-green text-white font-bold shadow-md scale-100'
              : 'bg-white text-text-muted hover:text-text-main hover:bg-slate-50 border border-slate-200'
          ]"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="activeFilter === 'AVAILABLE' ? 'bg-white animate-pulse' : 'bg-status-green'"></span>
          <span>Kamar Tersedia</span>
          <span class="text-[10px] opacity-75 font-normal">({{ rooms.filter((r: any) => r.status === 'AVAILABLE').length }})</span>
        </button>

        <button
          @click="activeFilter = 'RENTED'"
          :class="[
            'tab-spring px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 cursor-pointer active:scale-95',
            activeFilter === 'RENTED'
              ? 'bg-status-red text-white font-bold shadow-md scale-100'
              : 'bg-white text-text-muted hover:text-text-main hover:bg-slate-50 border border-slate-200'
          ]"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="activeFilter === 'RENTED' ? 'bg-white' : 'bg-status-red'"></span>
          <span>Tersewa / Penuh</span>
          <span class="text-[10px] opacity-75 font-normal">({{ rooms.filter((r: any) => r.status === 'RENTED').length }})</span>
        </button>
      </div>

      <!-- Empty State with pop in -->
      <div v-if="filteredRooms.length === 0" class="text-center py-16 sm:py-20 bg-white rounded-3xl border border-slate-100 p-8 animate-fade-up">
        <div class="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-text-muted text-2xl animate-bounce">
          🏠
        </div>
        <h3 class="text-base font-bold text-text-main">Tidak ada kamar ditemukan</h3>
        <p class="text-xs text-text-muted mt-1">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
      </div>

      <!-- Room Cards Grid with Fluid Transitions -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        <article
          v-for="room in filteredRooms"
          :key="room.id"
          class="card-interactive bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col justify-between group"
        >
          <div>
            <!-- Image & Badges with smooth hover zoom -->
            <div
              @click="openModal(room)"
              class="relative w-full h-48 sm:h-52 rounded-2xl overflow-hidden bg-slate-100 cursor-pointer mb-3.5 shadow-inner"
            >
              <img
                :src="room.images?.[0]?.url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'"
                :alt="room.name"
                class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-[var(--ease-smooth)]"
              />

              <!-- Overlay Hover Prompt with smooth backdrop blur -->
              <div class="absolute inset-0 bg-black/35 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span class="bg-white/95 text-brand-dark text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-[var(--ease-spring)]">
                  <Icon name="lucide:maximize-2" class="w-3.5 h-3.5" />
                  Lihat {{ room.images?.length || 1 }} Foto
                </span>
              </div>

              <!-- Status Badge (Hijau = Tersedia / Merah = Tersewa) -->
              <div class="absolute top-2.5 right-2.5">
                <span
                  :class="[
                    'text-[10px] sm:text-[11px] font-extrabold px-2.5 sm:px-3 py-1 rounded-full shadow-md flex items-center gap-1.5',
                    room.status === 'AVAILABLE'
                      ? 'bg-status-green text-white'
                      : 'bg-status-red text-white'
                  ]"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-white" :class="room.status === 'AVAILABLE' ? 'animate-pulse' : ''"></span>
                  {{ room.status === 'AVAILABLE' ? 'Tersedia' : 'Tersewa' }}
                </span>
              </div>

              <!-- Photo Count -->
              <div class="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg flex items-center gap-1">
                <Icon name="lucide:camera" class="w-3 h-3" />
                <span>{{ room.images?.length || 0 }} Foto</span>
              </div>
            </div>

            <!-- Title & Price -->
            <div class="mb-2.5">
              <h3 class="font-extrabold text-base text-text-main line-clamp-1 group-hover:text-brand-dark transition-colors">{{ room.name }}</h3>
              <p class="text-sm font-extrabold text-brand-dark mt-0.5">
                {{ formatRupiah(room.price) }}
                <span class="text-xs font-normal text-text-muted">/ bulan</span>
              </p>
            </div>

            <!-- Description -->
            <p v-if="room.description" class="text-xs text-text-muted leading-relaxed line-clamp-2 mb-3">
              {{ room.description }}
            </p>

            <!-- Facilities tags -->
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span
                v-for="fac in room.facilities.slice(0, 3)"
                :key="fac"
                class="text-[10px] sm:text-[11px] font-medium bg-slate-50 border border-slate-100 text-text-main px-2 sm:px-2.5 py-1 rounded-lg flex items-center gap-1 group-hover:border-slate-200 transition-colors"
              >
                <Icon name="lucide:check" class="w-3 h-3 text-status-green" />
                {{ fac }}
              </span>
              <span v-if="room.facilities.length > 3" class="text-[10px] text-text-muted font-medium self-center">
                +{{ room.facilities.length - 3 }} lainnya
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
              class="btn-spring w-full bg-brand-yellow hover:bg-brand-yellow-hover text-brand-dark text-xs sm:text-sm font-extrabold py-3 sm:py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xs min-h-[44px]"
            >
              <Icon name="lucide:message-circle" class="w-4 h-4 text-brand-dark" />
              <span>Tanya Kamar Ini via WA</span>
            </a>

            <!-- If Rented: Inactive / Ask Waitlist -->
            <a
              v-else
              :href="`https://wa.me/${setting.whatsapp}?text=${encodeURIComponent('Halo kak ' + setting.ownerName + ', apakah kamar ' + room.name + ' ada antrian jika nanti kosong?')}`"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-spring w-full bg-slate-100 hover:bg-slate-200 text-text-muted text-xs font-bold py-3 sm:py-2.5 rounded-xl flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Icon name="lucide:bell" class="w-4 h-4" />
              <span>Kamar Tersewa (Kabari Nanti)</span>
            </a>

            <!-- Detail link -->
            <NuxtLink
              :to="`/kamar/${room.slug}`"
              class="block text-center text-xs text-text-muted hover:text-text-main font-semibold py-1 transition-colors group-hover:translate-x-0.5 duration-200"
            >
              Lihat Detail Lengkap &rarr;
            </NuxtLink>
          </div>
        </article>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- 3. HIGHLIGHT FEATURE CARDS                     -->
    <!-- ============================================== -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
      <!-- Dark Navy Contrast Card -->
      <article class="card-interactive bg-brand-dark text-white rounded-3xl sm:rounded-3.5xl p-5 sm:p-8 shadow-card flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-brand-yellow uppercase tracking-wider">Keamanan &amp; Kenyamanan</span>
            <Icon name="lucide:shield-check" class="w-5 h-5 text-brand-yellow" />
          </div>
          <h3 class="text-lg sm:text-xl font-bold tracking-tight mb-2">Hunian Aman, Bersih, dan Tenang</h3>
          <p class="text-xs text-slate-300 leading-relaxed mb-6">
            Setiap kamar dirawat secara berkala untuk menjaga kebersihan dan kenyamanan penghuni. Lingkungan aman dan ramah untuk belajar maupun beristirahat setelah beraktivitas.
          </p>
        </div>
        <div class="pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
          <span>Akses 24 Jam &bull; Kunci Mandiri</span>
          <span class="text-white font-bold">{{ setting.kosName }}</span>
        </div>
      </article>

      <!-- Yellow Contrast Card -->
      <article class="card-interactive bg-brand-yellow text-brand-dark rounded-3xl sm:rounded-3.5xl p-5 sm:p-8 shadow-card flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-extrabold uppercase tracking-wider text-brand-dark/70">Langsung ke Pemilik</span>
            <Icon name="lucide:badge-percent" class="w-5 h-5 text-brand-dark" />
          </div>
          <h3 class="text-lg sm:text-xl font-extrabold tracking-tight mb-2">Tanpa Biaya Admin &amp; Perantara</h3>
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
    <!-- 4. MODAL / LIGHTBOX GALERI FOTO (Fluid Spring) -->
    <!-- ============================================== -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="activeModalRoom"
          class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
          @click.self="closeModal"
        >
          <div class="modal-spring-enter-active bg-white rounded-t-3.5xl sm:rounded-3.5xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-fade-up">
            <!-- Modal Header -->
            <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 class="font-bold text-base text-text-main">{{ activeModalRoom.name }}</h3>
                <p class="text-xs text-text-muted">{{ formatRupiah(activeModalRoom.price) }} / bulan</p>
              </div>
              <button
                @click="closeModal"
                class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-text-main flex items-center justify-center transition-transform duration-200 active:scale-90 hover:rotate-90 cursor-pointer"
              >
                <Icon name="lucide:x" class="w-4 h-4" />
              </button>
            </div>

            <!-- Active Photo Preview with Crossfade -->
            <div class="p-4 sm:p-6 overflow-y-auto space-y-4">
              <div class="w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 relative shadow-inner">
                <img
                  :key="activePhotoIndex"
                  :src="activeModalRoom.images?.[activePhotoIndex]?.url || activeModalRoom.images?.[0]?.url"
                  class="w-full h-full object-cover transition-opacity duration-300"
                />
              </div>

              <!-- Thumbnail Carousel with spring indicator -->
              <div v-if="activeModalRoom.images?.length > 1" class="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                  v-for="(img, idx) in activeModalRoom.images"
                  :key="img.id || idx"
                  @click="activePhotoIndex = Number(idx)"
                  :class="[
                    'w-16 sm:w-20 h-12 sm:h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-300 ease-[var(--ease-spring)] cursor-pointer',
                    activePhotoIndex === Number(idx) ? 'border-brand-yellow scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-102'
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
            <div class="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <NuxtLink
                :to="`/kamar/${activeModalRoom.slug}`"
                class="text-xs font-bold text-text-muted hover:text-text-main text-center order-2 sm:order-1 transition-colors"
              >
                Buka Halaman Detail Penuh &rarr;
              </NuxtLink>
              <a
                :href="getWhatsAppRoomLink(activeModalRoom)"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-spring w-full sm:w-auto bg-brand-dark hover:bg-brand-dark-hover text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm order-1 sm:order-2 min-h-[44px]"
              >
                <Icon name="lucide:message-circle" class="w-4 h-4 text-brand-yellow" />
                <span>Hubungi via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>
