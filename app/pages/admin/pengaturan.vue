<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const { triggerToast } = useToast()

const { data: settingsRes, refresh } = await useFetch('/api/public/settings')

const form = ref({
  kosName: '',
  ownerName: '',
  whatsapp: '',
  address: '',
  mapsUrl: '',
})

const isSubmitting = ref(false)
const errorMessage = ref('')

watchEffect(() => {
  if (settingsRes.value?.data) {
    const s = settingsRes.value.data
    form.value.kosName = s.kosName || 'EvaKos'
    form.value.ownerName = s.ownerName || 'Villa'
    form.value.whatsapp = s.whatsapp || '6281234567890'
    form.value.address = s.address || ''
    form.value.mapsUrl = s.mapsUrl || ''
  }
})

const handleSubmit = async () => {
  if (!form.value.whatsapp) {
    errorMessage.value = 'Nomor WhatsApp harus diisi'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const res = await $fetch('/api/admin/settings', {
      method: 'PUT',
      body: form.value,
    })
    triggerToast(res.message || 'Pengaturan berhasil disimpan! ✅')
    await refresh()
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || 'Gagal menyimpan pengaturan'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6 max-w-2xl">
    <div>
      <NuxtLink to="/admin" class="text-xs text-text-muted hover:text-text-main flex items-center gap-1 mb-1 transition-ui">
        <Icon name="lucide:arrow-left" class="w-3.5 h-3.5" />
        <span>Kembali ke Dashboard</span>
      </NuxtLink>
      <h2 class="font-extrabold text-xl text-text-main tracking-tight">Pengaturan Kontak &amp; Profil Kos</h2>
      <p class="text-xs text-text-muted mt-1">Ubah nomor WhatsApp tujuan chat calon penyewa dan informasi kos Anda.</p>
    </div>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="bg-red-50 text-status-red text-xs p-3.5 rounded-2xl border border-red-100 flex items-center gap-2">
      <Icon name="lucide:alert-circle" class="w-4 h-4 flex-shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <form @submit.prevent="handleSubmit" class="bg-white rounded-2.5xl p-6 border border-slate-100 shadow-sm space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-text-main mb-1.5">Nama Kos</label>
          <input
            v-model="form.kosName"
            type="text"
            required
            placeholder="EvaKos"
            class="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-brand-yellow focus:ring-2 focus:ring-yellow-100 transition-ui"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-text-main mb-1.5">Nama Pemilik</label>
          <input
            v-model="form.ownerName"
            type="text"
            required
            placeholder="Villa"
            class="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-brand-yellow focus:ring-2 focus:ring-yellow-100 transition-ui"
          />
        </div>
      </div>

      <!-- WhatsApp Field -->
      <div>
        <label class="block text-xs font-bold text-text-main mb-1.5">
          Nomor WhatsApp Pemilik (Untuk Menerima Chat)
        </label>
        <div class="relative">
          <input
            v-model="form.whatsapp"
            type="text"
            required
            placeholder="Contoh: 081234567890 atau 6281234567890"
            class="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-brand-yellow focus:ring-2 focus:ring-yellow-100 transition-ui"
          />
          <Icon name="lucide:phone" class="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <p class="text-[10px] text-text-muted mt-1">
          Bisa diawali angka 08 atau 62. Sistem akan otomatis menyesuaikan agar bisa langsung diklik oleh calon penyewa.
        </p>
      </div>

      <!-- Alamat -->
      <div>
        <label class="block text-xs font-bold text-text-main mb-1.5">Alamat Lengkap Kos</label>
        <textarea
          v-model="form.address"
          rows="2"
          placeholder="Jl. Merpati No. 18, Dekat Kampus..."
          class="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-brand-yellow focus:ring-2 focus:ring-yellow-100 transition-ui"
        ></textarea>
      </div>

      <!-- Google Maps URL -->
      <div>
        <label class="block text-xs font-bold text-text-main mb-1.5">Tautan Google Maps (Opsional)</label>
        <input
          v-model="form.mapsUrl"
          type="url"
          placeholder="https://maps.google.com/..."
          class="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-brand-yellow focus:ring-2 focus:ring-yellow-100 transition-ui"
        />
      </div>

      <!-- Live WA Preview -->
      <div class="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
        <div class="flex items-center gap-2 mb-1.5">
          <Icon name="lucide:message-circle" class="w-4 h-4 text-emerald-700" />
          <h4 class="text-xs font-bold text-emerald-900">Simulasi Chat Calon Penyewa</h4>
        </div>
        <p class="text-[11px] text-emerald-800 italic">
          "Halo kak {{ form.ownerName || 'Villa' }}, saya lihat dari website tertarik dengan Kamar Tipe Deluxe di {{ form.kosName || 'EvaKos' }}. Apakah masih tersedia?"
        </p>
      </div>

      <!-- Submit button -->
      <div class="pt-4 flex justify-end">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="bg-brand-dark hover:bg-brand-dark-hover text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-ui flex items-center gap-2 shadow-md disabled:opacity-50 active:scale-95"
        >
          <Icon v-if="isSubmitting" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan Pengaturan' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

