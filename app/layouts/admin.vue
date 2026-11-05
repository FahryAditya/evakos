<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { triggerToast } = useToast()

const { data: meRes } = await useFetch('/api/auth/me')
const user = computed(() => meRes.value?.user || { name: 'Villa', email: 'villa@evakos.com' })

const { data: adminRoomsRes, refresh: refreshRooms } = await useFetch('/api/admin/rooms')
const stats = computed(() => adminRoomsRes.value?.stats || { total: 0, available: 0, rented: 0 })

const handleLogout = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    triggerToast('Berhasil keluar')
    router.push('/admin/login')
  } catch (err) {
    triggerToast('Gagal keluar')
  }
}

const navLinks = [
  { name: 'Dashboard Kamar', path: '/admin', icon: 'lucide:layout-grid' },
  { name: 'Tambah Kamar', path: '/admin/kamar/tambah', icon: 'lucide:plus-circle' },
  { name: 'Pengaturan & WA', path: '/admin/pengaturan', icon: 'lucide:settings' },
]

const isActive = (path: string) => {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="min-h-screen p-3 md:p-6 lg:p-8 flex items-center justify-center bg-canvas">
    <!-- Main Dashboard Canvas Container (Adapted from Visual Reference) -->
    <main class="w-full max-w-[1440px] bg-white rounded-[32px] shadow-2xl border border-slate-100 flex flex-col xl:flex-row relative min-h-[860px] overflow-hidden">
      
      <!-- ============================================== -->
      <!-- 1. LEFT SIDEBAR                                -->
      <!-- ============================================== -->
      <aside class="w-full xl:w-[250px] flex-shrink-0 bg-white border-b xl:border-b-0 xl:border-r border-slate-100 p-6 flex flex-col justify-between">
        <div>
          <!-- Logo -->
          <NuxtLink to="/admin" class="flex items-center gap-3 px-2 mb-8">
            <div class="grid grid-cols-2 gap-1 w-6 h-6">
              <span class="w-2.5 h-2.5 bg-brand-yellow rounded-sm"></span>
              <span class="w-2.5 h-2.5 bg-brand-dark rounded-sm"></span>
              <span class="w-2.5 h-2.5 bg-brand-dark rounded-sm"></span>
              <span class="w-2.5 h-2.5 bg-brand-yellow rounded-sm"></span>
            </div>
            <div>
              <h1 class="font-extrabold text-sm tracking-tight text-text-main uppercase leading-tight">EvaKos</h1>
              <h2 class="font-bold text-[10px] tracking-wider text-text-muted uppercase leading-none">Panel Pemilik</h2>
            </div>
          </NuxtLink>

          <!-- Navigation Links -->
          <nav class="space-y-1.5">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.path"
              :to="link.path"
              :class="[
                'w-full flex items-center gap-3.5 px-4 py-3 rounded-full text-[13px] font-semibold transition-ui text-left relative',
                isActive(link.path)
                  ? 'bg-brand-yellow text-brand-dark font-bold pl-7 shadow-sm'
                  : 'text-text-muted hover:text-text-main hover:bg-slate-50'
              ]"
            >
              <!-- Active Left Indicator Bar -->
              <span
                v-if="isActive(link.path)"
                class="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-brand-dark rounded-full"
              ></span>
              <Icon :name="link.icon" class="w-4 h-4 flex-shrink-0" />
              <span>{{ link.name }}</span>
            </NuxtLink>

            <!-- Link Lihat Web Publik -->
            <NuxtLink
              to="/"
              target="_blank"
              class="w-full flex items-center gap-3.5 px-4 py-3 rounded-full text-[13px] font-medium text-text-muted hover:text-text-main hover:bg-slate-50 transition-ui text-left"
            >
              <Icon name="lucide:external-link" class="w-4 h-4 flex-shrink-0 text-text-muted" />
              <span>Lihat Web Publik</span>
            </NuxtLink>
          </nav>
        </div>

        <!-- Help / Quick Action Card Widget (Dark Navy) -->
        <div class="mt-8 relative pt-4">
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center font-bold text-brand-dark text-xs shadow-md border-2 border-white">
            <Icon name="lucide:shield-check" class="w-4 h-4" />
          </div>
          <div class="bg-brand-dark rounded-2xl pt-6 pb-4 px-4 text-center text-white">
            <h3 class="font-bold text-[13px] mb-1">Status Kos</h3>
            <p class="text-[11px] text-slate-300 leading-snug mb-3">
              {{ stats.available }} Kamar Tersedia<br>
              {{ stats.rented }} Kamar Tersewa
            </p>
            <button
              @click="handleLogout"
              class="w-full bg-white hover:bg-slate-100 text-brand-dark text-[11px] font-bold py-2 rounded-xl transition-ui active:scale-95"
            >
              Keluar Sesi
            </button>
          </div>
        </div>
      </aside>

      <!-- ============================================== -->
      <!-- 2. CENTER CONTENT HUB                          -->
      <!-- ============================================== -->
      <section class="flex-1 p-6 lg:p-8 overflow-y-auto no-scrollbar space-y-6">
        <slot />
      </section>

      <!-- ============================================== -->
      <!-- 3. RIGHT PROFILE & QUICK STATS RAIL            -->
      <!-- ============================================== -->
      <aside class="w-full xl:w-[280px] flex-shrink-0 bg-white border-t xl:border-t-0 xl:border-l border-slate-100 p-6 flex flex-col justify-between space-y-6">
        <div>
          <!-- Profile Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-sm text-text-main">Profil Pemilik</h3>
            <NuxtLink to="/admin/pengaturan" class="text-text-muted hover:text-text-main transition-ui p-1 rounded-md hover:bg-slate-50">
              <Icon name="lucide:settings" class="w-4 h-4" />
            </NuxtLink>
          </div>

          <!-- User Info Widget -->
          <div class="text-center mb-6">
            <div class="relative inline-block mb-2">
              <div class="w-16 h-16 rounded-full bg-brand-yellow/20 text-brand-dark flex items-center justify-center font-bold text-xl ring-4 ring-brand-yellow/30 mx-auto">
                <Icon name="lucide:user" class="w-8 h-8 text-brand-dark" />
              </div>
            </div>
            <h4 class="font-bold text-sm text-text-main leading-tight">{{ user.name }}</h4>
            <p class="text-[11px] text-text-muted mt-0.5">{{ user.email }}</p>
          </div>

          <!-- Quick Stats Pill (Adapted from Calendar visual widget) -->
          <div class="bg-slate-50/70 border border-slate-100 rounded-2.5xl p-4 mb-6 space-y-3">
            <h4 class="font-bold text-xs text-text-main">Ringkasan Kamar</h4>
            <div class="grid grid-cols-2 gap-2 text-center">
              <div class="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <span class="block text-xl font-extrabold text-status-green">{{ stats.available }}</span>
                <span class="text-[10px] font-semibold text-text-muted uppercase">Tersedia</span>
              </div>
              <div class="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <span class="block text-xl font-extrabold text-status-red">{{ stats.rented }}</span>
                <span class="text-[10px] font-semibold text-text-muted uppercase">Tersewa</span>
              </div>
            </div>
          </div>

          <!-- Quick Tip Card -->
          <div class="bg-brand-dark text-white rounded-2.5xl p-4 shadow-sm relative overflow-hidden">
            <div class="flex items-center gap-2 mb-2">
              <span class="w-2 h-2 rounded-full bg-brand-yellow"></span>
              <h5 class="font-bold text-xs">Tips Praktis</h5>
            </div>
            <p class="text-[11px] text-slate-300 leading-relaxed">
              Jika kamar laku tersewa, Anda cukup klik saklar status di tabel untuk mengubahnya secara instan!
            </p>
          </div>
        </div>

        <!-- Footer in Aside -->
        <div class="text-center text-[10px] text-text-muted">
          EvaKos Admin &bull; 2026
        </div>
      </aside>

    </main>
  </div>
</template>

