<script setup lang="ts">
definePageMeta({
  layout: false,
})

const router = useRouter()
const { triggerToast } = useToast()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Email dan password harus diisi'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
      },
    })

    if (res.success) {
      triggerToast('Selamat datang, kak Villa! 👋')
      router.push('/admin')
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || err?.statusMessage || 'Gagal masuk. Periksa email & password.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-canvas flex items-center justify-center p-3.5 sm:p-6">
    <div class="w-full max-w-md bg-white rounded-3xl sm:rounded-3.5xl p-6 sm:p-10 shadow-xl border border-slate-100">
      <!-- Logo Header -->
      <div class="flex items-center justify-center gap-3 mb-6 sm:mb-8">
        <div class="grid grid-cols-2 gap-1 w-6 h-6 sm:w-7 sm:h-7">
          <span class="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-brand-yellow rounded-xs sm:rounded-sm"></span>
          <span class="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-brand-dark rounded-xs sm:rounded-sm"></span>
          <span class="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-brand-dark rounded-xs sm:rounded-sm"></span>
          <span class="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-brand-yellow rounded-xs sm:rounded-sm"></span>
        </div>
        <h1 class="font-extrabold text-lg sm:text-xl text-text-main tracking-tight uppercase">EvaKos Admin</h1>
      </div>

      <div class="text-center mb-6">
        <h2 class="text-lg sm:text-xl font-bold text-text-main">Masuk ke Panel Pemilik</h2>
        <p class="text-xs text-text-muted mt-1">Kelola data kamar, foto, dan status ketersediaan</p>
      </div>

      <!-- Alert Error -->
      <div v-if="errorMessage" class="mb-5 bg-red-50 text-status-red text-xs p-3 rounded-2xl border border-red-100 flex items-center gap-2">
        <Icon name="lucide:alert-circle" class="w-4 h-4 flex-shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-text-main mb-1.5">Email Pemilik</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 text-xs rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-brand-yellow focus:ring-2 focus:ring-yellow-100 transition-ui min-h-[44px]"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-text-main mb-1.5">Kata Sandi</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-3 text-xs rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-brand-yellow focus:ring-2 focus:ring-yellow-100 transition-ui min-h-[44px]"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-brand-dark hover:bg-brand-dark-hover text-white font-bold py-3.5 px-4 rounded-2xl text-xs transition-ui flex items-center justify-center gap-2 shadow-md disabled:opacity-50 active:scale-95 mt-2 min-h-[44px]"
        >
          <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <span>{{ isLoading ? 'Memverifikasi...' : 'Masuk Sekarang' }}</span>
        </button>
      </form>

      <div class="mt-8 pt-6 border-t border-slate-100 text-center">
        <NuxtLink to="/" class="text-xs font-semibold text-text-muted hover:text-text-main inline-flex items-center gap-1.5 transition-ui">
          <Icon name="lucide:arrow-left" class="w-3.5 h-3.5" />
          <span>Kembali ke Halaman Publik</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
