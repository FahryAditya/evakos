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
  <div class="flex-1 flex flex-col justify-between">
    <!-- Top Navigation Header -->
    <header class="sticky top-0 z-40 px-3 sm:px-6 pt-3">
      <div class="max-w-[1360px] mx-auto bg-white/90 backdrop-blur-md border border-slate-200/70 rounded-full px-5 py-3 shadow-sm flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-3">
          <div class="grid grid-cols-2 gap-1 w-6 h-6">
            <span class="w-2.5 h-2.5 bg-brand-yellow rounded-sm"></span>
            <span class="w-2.5 h-2.5 bg-brand-dark rounded-sm"></span>
            <span class="w-2.5 h-2.5 bg-brand-dark rounded-sm"></span>
            <span class="w-2.5 h-2.5 bg-brand-yellow rounded-sm"></span>
          </div>
          <div>
            <h1 class="font-extrabold text-sm tracking-tight text-text-main uppercase leading-tight">{{ setting.kosName }}</h1>
            <p class="font-bold text-[10px] tracking-wider text-text-muted uppercase leading-none">Hunian Nyaman &amp; Bersih</p>
          </div>
        </NuxtLink>

        <!-- Right action: WA Contact button -->
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/admin/login"
            class="hidden sm:inline-flex text-xs font-semibold text-text-muted hover:text-text-main px-3 py-1.5 rounded-full transition-ui"
          >
            Kelola Kos (Admin)
          </NuxtLink>
          <a
            :href="waLink"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 bg-brand-dark hover:bg-brand-dark-hover text-white text-xs font-bold px-4 py-2 rounded-full transition-ui shadow-sm active:scale-95"
          >
            <Icon name="lucide:message-circle" class="w-4 h-4 text-brand-yellow" />
            <span class="hidden sm:inline">Hubungi Pemilik</span>
            <span class="sm:hidden">WhatsApp</span>
          </a>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Floating WhatsApp CTA (Bottom Left/Right Mobile Optimized) -->
    <div class="fixed bottom-6 right-6 z-40 sm:hidden">
      <a
        :href="waLink"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold p-3.5 rounded-full shadow-2xl active:scale-90 transition-ui"
      >
        <Icon name="lucide:message-circle" class="w-6 h-6" />
      </a>
    </div>

    <!-- Footer -->
    <footer class="mt-16 border-t border-slate-200/80 bg-white py-8 px-4 text-center">
      <div class="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
        <p>&copy; 2026 {{ setting.kosName }} &bull; Dikelola langsung oleh kak {{ setting.ownerName }}</p>
        <div class="flex items-center gap-4">
          <NuxtLink to="/admin/login" class="hover:text-text-main underline">
            Login Pemilik Kos
          </NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>

