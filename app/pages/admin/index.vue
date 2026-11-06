<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const { triggerToast } = useToast()

const { data: roomsRes, pending, refresh } = await useFetch('/api/admin/rooms')
const rooms = computed(() => roomsRes.value?.data || [])
const stats = computed(() => roomsRes.value?.stats || { total: 0, available: 0, rented: 0 })

const searchQuery = ref('')
const selectedTab = ref<'all' | 'AVAILABLE' | 'RENTED'>('all')

const filteredRooms = computed(() => {
  return rooms.value.filter((room: any) => {
    const matchQuery = room.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    if (!matchQuery) return false
    if (selectedTab.value === 'all') return true
    return room.status === selectedTab.value
  })
})

// Fast 1-Click Status Toggle (Villa's main request)
const toggleStatus = async (room: any) => {
  const newStatus = room.status === 'AVAILABLE' ? 'RENTED' : 'AVAILABLE'
  try {
    const res = await $fetch(`/api/admin/rooms/${room.id}/status`, {
      method: 'PATCH',
      body: { status: newStatus },
    })
    room.status = newStatus
    triggerToast(res.message || 'Status kamar berhasil diperbarui!')
    await refresh()
  } catch (err: any) {
    triggerToast(err?.data?.statusMessage || 'Gagal mengubah status kamar')
  }
}

const deleteRoom = async (id: string, name: string) => {
  if (!confirm(`Hapus ${name}? Foto dan data kamar akan terhapus permanen.`)) return
  try {
    await $fetch(`/api/admin/rooms/${id}`, { method: 'DELETE' })
    triggerToast('Kamar berhasil dihapus')
    await refresh()
  } catch (err) {
    triggerToast('Gagal menghapus kamar')
  }
}

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}
</script>

<template>
  <div class="space-y-5 sm:space-y-6">
    <!-- Top Bar: Greeting & Search Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      <div>
        <div class="flex items-center gap-1.5">
          <h2 class="font-extrabold text-base sm:text-lg text-text-main tracking-tight">Halo, kak Villa</h2>
          <span class="text-base sm:text-lg">👋</span>
        </div>
        <p class="text-[11px] sm:text-xs text-text-muted mt-0.5">Kelola status kamar kos dan foto promosi di sini.</p>
      </div>

      <!-- Search & Tambah Kamar CTA -->
      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <div class="relative flex-1 sm:w-64">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari kamar..."
            class="w-full pl-9 pr-4 py-2 sm:py-2 text-xs rounded-full border border-slate-200 bg-white placeholder-slate-400 text-text-main focus:outline-none focus:border-brand-yellow focus:ring-2 focus:ring-yellow-100 transition-ui"
          />
          <Icon name="lucide:search" class="w-3.5 h-3.5 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <NuxtLink
          to="/admin/kamar/tambah"
          class="btn-spring flex items-center gap-1.5 bg-brand-yellow hover:bg-brand-yellow-hover text-brand-dark px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold shadow-xs flex-shrink-0"
        >
          <Icon name="lucide:plus" class="w-4 h-4 stroke-[2.5]" />
          <span class="hidden xs:inline">Tambah Kamar</span>
          <span class="xs:hidden">Tambah</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Quick Stat Cards (Mobile Optimized: 3 Columns) -->
    <div class="grid grid-cols-3 gap-2.5 sm:gap-4">
      <!-- Total Kamar -->
      <div class="card-interactive bg-white rounded-2xl sm:rounded-2.5xl p-3 sm:p-5 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center sm:justify-between text-center sm:text-left">
        <div>
          <span class="text-[10px] sm:text-xs font-semibold text-text-muted">Total Kamar</span>
          <p class="text-xl sm:text-2xl font-extrabold text-text-main mt-0.5 sm:mt-1">{{ stats.total }}</p>
        </div>
        <div class="hidden sm:flex w-10 h-10 rounded-xl bg-amber-50 text-amber-600 items-center justify-center text-xl flex-shrink-0">
          <Icon name="lucide:door-closed" class="w-5 h-5" />
        </div>
      </div>

      <!-- Kamar Tersedia -->
      <div class="card-interactive bg-emerald-50/70 rounded-2xl sm:rounded-2.5xl p-3 sm:p-5 border border-emerald-100 shadow-xs flex flex-col sm:flex-row items-center sm:justify-between text-center sm:text-left">
        <div>
          <span class="text-[10px] sm:text-xs font-semibold text-emerald-800">Tersedia</span>
          <p class="text-xl sm:text-2xl font-extrabold text-status-green mt-0.5 sm:mt-1">{{ stats.available }}</p>
        </div>
        <div class="hidden sm:flex w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 items-center justify-center text-xl flex-shrink-0">
          <Icon name="lucide:check-circle" class="w-5 h-5" />
        </div>
      </div>

      <!-- Kamar Tersewa -->
      <div class="card-interactive bg-red-50/70 rounded-2xl sm:rounded-2.5xl p-3 sm:p-5 border border-red-100 shadow-xs flex flex-col sm:flex-row items-center sm:justify-between text-center sm:text-left">
        <div>
          <span class="text-[10px] sm:text-xs font-semibold text-red-800">Tersewa</span>
          <p class="text-xl sm:text-2xl font-extrabold text-status-red mt-0.5 sm:mt-1">{{ stats.rented }}</p>
        </div>
        <div class="hidden sm:flex w-10 h-10 rounded-xl bg-red-100 text-red-700 items-center justify-center text-xl flex-shrink-0">
          <Icon name="lucide:key" class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- Filter Tabs (Horizontally Scrollable) -->
    <div class="flex items-center gap-2 sm:gap-4 text-xs border-b border-slate-100 pb-2 overflow-x-auto no-scrollbar whitespace-nowrap">
      <button
        @click="selectedTab = 'all'"
        :class="[
          'tab-spring px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 cursor-pointer active:scale-95',
          selectedTab === 'all'
            ? 'bg-brand-dark text-white font-bold shadow-md'
            : 'bg-slate-100/70 text-text-muted hover:text-text-main'
        ]"
      >
        <span>Semua</span>
        <span class="text-[10px] opacity-75">({{ stats.total }})</span>
      </button>

      <button
        @click="selectedTab = 'AVAILABLE'"
        :class="[
          'tab-spring px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 cursor-pointer active:scale-95',
          selectedTab === 'AVAILABLE'
            ? 'bg-status-green text-white font-bold shadow-md'
            : 'bg-slate-100/70 text-text-muted hover:text-text-main'
        ]"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-status-green" :class="selectedTab === 'AVAILABLE' ? 'bg-white' : ''"></span>
        <span>Tersedia</span>
        <span class="text-[10px] opacity-75">({{ stats.available }})</span>
      </button>

      <button
        @click="selectedTab = 'RENTED'"
        :class="[
          'tab-spring px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 cursor-pointer active:scale-95',
          selectedTab === 'RENTED'
            ? 'bg-status-red text-white font-bold shadow-md'
            : 'bg-slate-100/70 text-text-muted hover:text-text-main'
        ]"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-status-red" :class="selectedTab === 'RENTED' ? 'bg-white' : ''"></span>
        <span>Tersewa</span>
        <span class="text-[10px] opacity-75">({{ stats.rented }})</span>
      </button>
    </div>

    <!-- Room Cards Grid -->
    <div v-if="filteredRooms.length === 0" class="text-center py-16 bg-white rounded-2.5xl border border-slate-100 p-8 animate-fade-up">
      <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-text-muted animate-bounce">
        <Icon name="lucide:inbox" class="w-6 h-6" />
      </div>
      <h3 class="text-sm font-bold text-text-main">Belum ada kamar yang cocok</h3>
      <p class="text-xs text-text-muted mt-1">Tambahkan kamar baru atau ubah kata kunci pencarian.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
      <div
        v-for="room in filteredRooms"
        :key="room.id"
        class="card-interactive bg-white rounded-2.5xl p-3.5 sm:p-4 border border-slate-100 shadow-xs hover:shadow-md flex flex-col justify-between group"
      >
        <div>
          <!-- Thumbnail Image & Status Badge -->
          <div class="relative w-full h-40 sm:h-44 rounded-2xl overflow-hidden mb-3 bg-slate-100 shadow-inner">
            <img
              :src="room.images?.[0]?.url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500'"
              :alt="room.name"
              class="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-[var(--ease-smooth)]"
            />
            <!-- Status Badge Floating -->
            <div class="absolute top-2.5 right-2.5">
              <span
                :class="[
                  'text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1',
                  room.status === 'AVAILABLE'
                    ? 'bg-status-green text-white'
                    : 'bg-status-red text-white'
                ]"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-white" :class="room.status === 'AVAILABLE' ? 'animate-pulse' : ''"></span>
                {{ room.status === 'AVAILABLE' ? 'Tersedia' : 'Tersewa' }}
              </span>
            </div>
            <!-- Photo Count Badge -->
            <div class="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Icon name="lucide:image" class="w-3 h-3" />
              <span>{{ room.images?.length || 0 }} foto</span>
            </div>
          </div>

          <!-- Room Info -->
          <h3 class="font-bold text-sm text-text-main line-clamp-1 group-hover:text-brand-dark transition-colors">{{ room.name }}</h3>
          <p class="text-xs font-extrabold text-brand-dark mt-0.5">
            {{ formatRupiah(room.price) }} <span class="text-[10px] font-normal text-text-muted">/ bulan</span>
          </p>

          <!-- Facilities pill -->
          <div class="flex flex-wrap gap-1 mt-2">
            <span
              v-for="fac in room.facilities.slice(0, 3)"
              :key="fac"
              class="text-[9px] sm:text-[10px] bg-slate-100 text-text-muted px-2 py-0.5 rounded-md"
            >
              {{ fac }}
            </span>
            <span v-if="room.facilities.length > 3" class="text-[9px] text-text-muted">
              +{{ room.facilities.length - 3 }} lainnya
            </span>
          </div>
        </div>

        <!-- Action Bar: Fast Status Toggle & CRUD buttons -->
        <div class="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <!-- Fast Toggle 1-Click Button with Spring Effect -->
          <button
            @click="toggleStatus(room)"
            :class="[
              'btn-spring text-[11px] font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 min-h-[38px] cursor-pointer',
              room.status === 'AVAILABLE'
                ? 'bg-red-50 text-status-red hover:bg-red-100'
                : 'bg-emerald-50 text-status-green hover:bg-emerald-100'
            ]"
          >
            <Icon :name="room.status === 'AVAILABLE' ? 'lucide:lock' : 'lucide:unlock'" class="w-3.5 h-3.5" />
            <span>{{ room.status === 'AVAILABLE' ? 'Set Tersewa' : 'Set Tersedia' }}</span>
          </button>

          <!-- Edit & Delete -->
          <div class="flex items-center gap-1">
            <NuxtLink
              :to="`/admin/kamar/${room.id}/edit`"
              class="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-slate-100 transition-ui"
              title="Edit Kamar"
            >
              <Icon name="lucide:edit-3" class="w-4 h-4" />
            </NuxtLink>
            <button
              @click="deleteRoom(room.id, room.name)"
              class="p-2 rounded-xl text-text-muted hover:text-status-red hover:bg-red-50 transition-ui"
              title="Hapus Kamar"
            >
              <Icon name="lucide:trash-2" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
