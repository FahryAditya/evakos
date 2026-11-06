<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { triggerToast } = useToast()

const { data: meRes } = await useFetch('/api/auth/me')
const user = computed(() => meRes.value?.user || { name: 'Villa', email: 'villa@evakos.com' })

const { data: adminRoomsRes } = await useFetch('/api/admin/rooms')
const stats = computed(() => adminRoomsRes.value?.stats || { total: 0, available: 0, rented: 0 })

// Mobile drawer state
const isMobileDrawerOpen = ref(false)

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
  <div class="min-h-screen bg-canvas p-0 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center">
    <!-- Main Dashboard Canvas Container (Adapted from Visual Reference) -->
    <main class="w-full max-w-[1440px] bg-white sm:rounded-[32px] sm:shadow-2xl sm:border border-slate-100 flex flex-col xl:flex-row relative min-h-screen sm:min-h-[860px] overflow-hidden">
      
      <!-- ============================================== -->
      <!-- MOBILE TOP BAR (Only visible on < xl)          -->
      <!-- ============================================== -->
      <header class="xl:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-xs">
        <!-- Logo -->
        <NuxtLink to="/admin" class="flex items-center gap-2.5">
          <div class="grid grid-cols-2 gap-1 w-5 h-5">
            <span class="w-2 h-2 bg-brand-yellow rounded-xs"></span>
            <span class="w-2 h-2 bg-brand-dark rounded-xs"></span>
            <span class="w-2 h-2 bg-brand-dark rounded-xs"></span>
            <span class="w-2 h-2 bg-brand-yellow rounded-xs"></span>
          </div>
          <div>
            <span class="font-extrabold text-xs tracking-tight text-text-main uppercase leading-tight">EvaKos</span>
            <span class="block text-[9px] font-bold text-text-muted uppercase leading-none">Admin</span>
          </div>
        </NuxtLink>

        <!-- Right Quick Pill: Status & Profile Button -->
        <div class="flex items-center gap-2">
          <!-- Room Status Badges Mini -->
          <div class="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-full text-[10px] font-bold">
            <span class="text-status-green flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-status-green"></span>
              {{ stats.available }} Kosong
            </span>
            <span class="text-slate-300">|</span>
            <span class="text-status-red flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-status-red"></span>
              {{ stats.rented }} Terisi
            </span>
          </div>

          <!-- Profile Trigger Button -->
          <button
            @click="isMobileDrawerOpen = true"
            class="w-8 h-8 rounded-full bg-brand-yellow/30 text-brand-dark flex items-center justify-center font-bold text-xs ring-2 ring-brand-yellow/40 active:scale-95 transition-ui"
            aria-label="Buka Profil"
          >
            <Icon name="lucide:user" class="w-4 h-4 text-brand-dark" />
          </button>
        </div>
      </header>

      <!-- ============================================== -->
      <!-- 1. LEFT SIDEBAR (Desktop Only: xl:flex)        -->
      <!-- ============================================== -->
      <aside class="hidden xl:flex w-[250px] flex-shrink-0 bg-white border-r border-slate-100 p-6 flex-col justify-between">
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
      <section class="flex-1 p-4 sm:p-6 lg:p-8 pb-28 sm:pb-28 xl:pb-8 overflow-y-auto no-scrollbar space-y-6">
        <slot />
      </section>

      <!-- ============================================== -->
      <!-- 3. RIGHT PROFILE & QUICK STATS RAIL (Desktop)  -->
      <!-- ============================================== -->
      <aside class="hidden xl:flex w-[280px] flex-shrink-0 bg-white border-l border-slate-100 p-6 flex-col justify-between space-y-6">
        <div>
          <!-- Profile Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-sm text-text-main">Profil Pemilik</h3>
            <NuxtLink to="/admin/pengaturan" class="text-text-muted hover:text-text-main transition-ui p-1 rounded-md hover:bg-slate-50" title="Pengaturan">
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

      <!-- ============================================== -->
      <!-- MOBILE BOTTOM NAVIGATION BAR (Fixed at Bottom) -->
      <!-- ============================================== -->
      <nav class="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-3 py-2 flex items-center justify-around shadow-2xl safe-area-inset-bottom">
        <!-- Dashboard -->
        <NuxtLink
          to="/admin"
          :class="[
            'flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-ui',
            isActive('/admin') ? 'text-brand-dark font-extrabold' : 'text-text-muted hover:text-text-main'
          ]"
        >
          <div :class="['p-1 rounded-lg transition-ui', isActive('/admin') ? 'bg-brand-yellow/30' : '']">
            <Icon name="lucide:layout-grid" class="w-5 h-5" />
          </div>
          <span class="text-[10px]">Dashboard</span>
        </NuxtLink>

        <!-- Tambah Kamar (Center Floating Accent) -->
        <NuxtLink
          to="/admin/kamar/tambah"
          class="flex flex-col items-center -mt-5 transition-transform duration-200 group active:scale-90"
        >
          <div class="w-12 h-12 rounded-full bg-brand-yellow text-brand-dark shadow-xl ring-4 ring-white flex items-center justify-center group-hover:scale-108 transition-transform duration-300 ease-[var(--ease-spring)] pulse-ring-yellow">
            <Icon name="lucide:plus" class="w-6 h-6 stroke-[2.5]" />
          </div>
          <span class="text-[10px] font-bold text-brand-dark mt-0.5">Tambah</span>
        </NuxtLink>

        <!-- Pengaturan -->
        <NuxtLink
          to="/admin/pengaturan"
          :class="[
            'flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-ui',
            isActive('/admin/pengaturan') ? 'text-brand-dark font-extrabold' : 'text-text-muted hover:text-text-main'
          ]"
        >
          <div :class="['p-1 rounded-lg transition-ui', isActive('/admin/pengaturan') ? 'bg-brand-yellow/30' : '']">
            <Icon name="lucide:settings" class="w-5 h-5" />
          </div>
          <span class="text-[10px]">Pengaturan</span>
        </NuxtLink>

        <!-- Web Publik -->
        <NuxtLink
          to="/"
          target="_blank"
          class="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-text-muted hover:text-text-main transition-ui"
        >
          <div class="p-1 rounded-lg">
            <Icon name="lucide:external-link" class="w-5 h-5" />
          </div>
          <span class="text-[10px]">Web Kos</span>
        </NuxtLink>
      </nav>

      <!-- ============================================== -->
      <!-- MOBILE PROFILE DRAWER / BOTTOM SHEET           -->
      <!-- ============================================== -->
      <Teleport to="body">
        <Transition name="modal-fade">
          <div
            v-if="isMobileDrawerOpen"
            class="xl:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
            @click.self="isMobileDrawerOpen = false"
          >
            <div class="w-full sm:max-w-md bg-white rounded-t-3.5xl sm:rounded-3.5xl p-6 shadow-2xl space-y-5 animate-fade-up">
              <!-- Drawer Header -->
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-full bg-brand-yellow/20 text-brand-dark flex items-center justify-center font-bold text-base ring-2 ring-brand-yellow/40">
                    <Icon name="lucide:user" class="w-5 h-5 text-brand-dark" />
                  </div>
                  <div>
                    <h3 class="font-extrabold text-sm text-text-main">{{ user.name }}</h3>
                    <p class="text-[11px] text-text-muted">{{ user.email }}</p>
                  </div>
                </div>
                <button
                  @click="isMobileDrawerOpen = false"
                  class="w-8 h-8 rounded-full bg-slate-100 text-text-muted hover:text-text-main flex items-center justify-center transition-transform duration-200 active:scale-90 hover:rotate-90 cursor-pointer"
                >
                  <Icon name="lucide:x" class="w-4 h-4" />
                </button>
              </div>

              <!-- Stats Recap -->
              <div class="bg-slate-50 rounded-2.5xl p-4 border border-slate-100 space-y-3">
                <h4 class="font-bold text-xs text-text-main">Status Ringkas Kamar</h4>
                <div class="grid grid-cols-3 gap-2 text-center">
                  <div class="bg-white p-2.5 rounded-xl border border-slate-100 shadow-xs">
                    <span class="block text-lg font-extrabold text-text-main">{{ stats.total }}</span>
                    <span class="text-[9px] font-semibold text-text-muted uppercase">Total</span>
                  </div>
                  <div class="bg-white p-2.5 rounded-xl border border-slate-100 shadow-xs">
                    <span class="block text-lg font-extrabold text-status-green">{{ stats.available }}</span>
                    <span class="text-[9px] font-semibold text-text-muted uppercase">Tersedia</span>
                  </div>
                  <div class="bg-white p-2.5 rounded-xl border border-slate-100 shadow-xs">
                    <span class="block text-lg font-extrabold text-status-red">{{ stats.rented }}</span>
                    <span class="text-[9px] font-semibold text-text-muted uppercase">Tersewa</span>
                  </div>
                </div>
              </div>

              <!-- Quick Action Links -->
              <div class="space-y-2">
                <NuxtLink
                  to="/admin/pengaturan"
                  @click="isMobileDrawerOpen = false"
                  class="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-text-main transition-colors group active:scale-98"
                >
                  <div class="flex items-center gap-2.5">
                    <Icon name="lucide:settings" class="w-4 h-4 text-text-muted group-hover:rotate-45 transition-transform duration-300" />
                    <span>Pengaturan Nomor WA &amp; Info Kos</span>
                  </div>
                  <Icon name="lucide:chevron-right" class="w-4 h-4 text-text-muted group-hover:translate-x-1 transition-transform" />
                </NuxtLink>

                <NuxtLink
                  to="/"
                  target="_blank"
                  class="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-text-main transition-colors group active:scale-98"
                >
                  <div class="flex items-center gap-2.5">
                    <Icon name="lucide:external-link" class="w-4 h-4 text-text-muted" />
                    <span>Kunjungi Halaman Publik</span>
                  </div>
                  <Icon name="lucide:chevron-right" class="w-4 h-4 text-text-muted group-hover:translate-x-1 transition-transform" />
                </NuxtLink>
              </div>

              <!-- Logout Button -->
              <button
                @click="handleLogout"
                class="btn-spring w-full bg-red-50 hover:bg-red-100 text-status-red text-xs font-bold py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Icon name="lucide:log-out" class="w-4 h-4" />
                <span>Keluar Sesi Admin</span>
              </button>
            </div>
          </div>
        </Transition>
      </Teleport>

    </main>
  </div>
</template>
