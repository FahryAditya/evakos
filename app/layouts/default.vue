<script setup lang="ts">
const { data: settingsRes } = await useFetch('/api/public/settings')
const setting = computed(() => settingsRes.value?.data || {
  kosName: 'EvaKos',
  ownerName: 'Villa',
  whatsapp: '6281234567890',
  address: 'Jl. Merpati No. 18, Pusat Kota',
})

const waLink = computed(() => {
  const text = encodeURIComponent(`Halo kak ${setting.value.ownerName}, saya ingin tanya-tanya seputar ketersediaan kamar di ${setting.value.kosName}.`)
  return `https://wa.me/${setting.value.whatsapp}?text=${text}`
})
</script>

<template>
  <div class="flex-1 flex flex-col justify-between overflow-x-hidden">
    <!-- Top Navigation Header -->
    <header class="sticky top-0 z-40 px-3 sm:px-6 pt-3">
      <div class="max-w-[1360px] mx-auto bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between gap-2">
        <!-- Logo with interactive hover tilt -->
        <NuxtLink to="/" class="flex items-center gap-2.5 sm:gap-3 flex-shrink-0 group">
          <div class="grid grid-cols-2 gap-1 w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform duration-300 ease-[var(--ease-spring)]">
            <span class="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-brand-yellow rounded-xs"></span>
            <span class="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-brand-dark rounded-xs"></span>
            <span class="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-brand-dark rounded-xs"></span>
            <span class="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-brand-yellow rounded-xs"></span>
          </div>
          <div>
            <h1 class="font-extrabold text-xs sm:text-sm tracking-tight text-text-main uppercase leading-tight group-hover:text-brand-dark transition-colors">{{ setting.kosName }}</h1>
            <p class="font-bold text-[9px] sm:text-[10px] tracking-wider text-text-muted uppercase leading-none">Hunian Nyaman &amp; Bersih</p>
          </div>
        </NuxtLink>

        <!-- Right actions -->
        <div class="flex items-center gap-2 sm:gap-3">
          <NuxtLink
            to="/admin/login"
            class="hidden md:inline-flex text-xs font-semibold text-text-muted hover:text-text-main px-3.5 py-2 rounded-full hover:bg-slate-100 transition-all duration-200 active:scale-95"
          >
            Kelola Kos (Admin)
          </NuxtLink>

          <a
            :href="waLink"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-spring flex items-center gap-1.5 sm:gap-2 bg-brand-dark hover:bg-brand-dark-hover text-white text-xs font-bold px-4 py-2 sm:py-2.5 rounded-full shadow-sm flex-shrink-0"
          >
            <Icon name="lucide:message-circle" class="w-4 h-4 text-brand-yellow animate-bounce" style="animation-duration: 2.5s;" />
            <span class="hidden sm:inline">Hubungi Pemilik</span>
            <span class="sm:hidden font-extrabold">WhatsApp</span>
          </a>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Floating WhatsApp CTA (Animated Floating Pill on Mobile) -->
    <div class="fixed bottom-6 right-5 z-40 sm:hidden animate-float">
      <a
        :href="waLink"
        target="_blank"
        rel="noopener noreferrer"
        class="relative flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl active:scale-90 transition-transform duration-200 pulse-ring-green"
        aria-label="Chat WhatsApp Pemilik"
      >
        <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-yellow border-2 border-white rounded-full animate-ping"></span>
        <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-yellow border-2 border-white rounded-full"></span>
        <Icon name="lucide:message-circle" class="w-7 h-7" />
      </a>
    </div>

    <!-- Footer -->
    <footer class="mt-16 border-t border-slate-200/80 bg-white py-8 px-4 text-center">
      <div class="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
        <p>&copy; 2026 {{ setting.kosName }} &bull; Dikelola langsung oleh kak {{ setting.ownerName }}</p>
        <div class="flex items-center gap-4">
          <NuxtLink to="/admin/login" class="hover:text-text-main font-semibold underline transition-colors">
            Login Pemilik Kos
          </NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>
