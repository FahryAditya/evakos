<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()
const { triggerToast } = useToast()
const roomId = route.params.id as string

const { data: adminRoomsRes } = await useFetch('/api/admin/rooms')
const currentRoom = computed(() => {
  return adminRoomsRes.value?.data?.find((r: any) => r.id === roomId)
})

const form = ref({
  name: '',
  price: 0,
  description: '',
  status: 'AVAILABLE' as 'AVAILABLE' | 'RENTED',
  order: 0,
})

const selectedFacilities = ref<string[]>([])
const customFacility = ref('')
const uploadedImages = ref<string[]>([])
const isUploading = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

const commonFacilities = [
  'AC',
  'Kamar Mandi Dalam',
  'Kamar Mandi Luar',
  'Kasur Springbed',
  'Kasur Busa',
  'WiFi Cepat',
  'Lemari Pakaian',
  'Meja Kerja / Belajar',
  'Dapur Bersama',
  'Kulkas Bersama',
  'Parkir Motor Aman',
  'Listrik Gratis / Termasuk',
]

// Populate form when room data is loaded
watchEffect(() => {
  if (currentRoom.value) {
    form.value.name = currentRoom.value.name
    form.value.price = currentRoom.value.price
    form.value.description = currentRoom.value.description || ''
    form.value.status = currentRoom.value.status
    form.value.order = currentRoom.value.order || 0
    selectedFacilities.value = [...(currentRoom.value.facilities || [])]
    uploadedImages.value = currentRoom.value.images?.map((img: any) => img.url) || []
  }
})

const toggleFacility = (item: string) => {
  const idx = selectedFacilities.value.indexOf(item)
  if (idx > -1) {
    selectedFacilities.value.splice(idx, 1)
  } else {
    selectedFacilities.value.push(item)
  }
}

const addCustomFacility = () => {
  const val = customFacility.value.trim()
  if (val && !selectedFacilities.value.includes(val)) {
    selectedFacilities.value.push(val)
    customFacility.value = ''
  }
}

const handleFileUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const formData = new FormData()
  for (let i = 0; i < target.files.length; i++) {
    formData.append('files', target.files[i])
  }

  isUploading.value = true
  errorMessage.value = ''

  try {
    const res = await $fetch<{ success: boolean; urls: string[] }>('/api/admin/upload', {
      method: 'POST',
      body: formData,
    })
    if (res.urls && res.urls.length > 0) {
      uploadedImages.value.push(...res.urls)
      triggerToast(`${res.urls.length} foto berhasil diunggah!`)
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || 'Gagal mengunggah foto.'
  } finally {
    isUploading.value = false
    target.value = ''
  }
}

const removeImage = (index: number) => {
  uploadedImages.value.splice(index, 1)
}

const setPrimaryImage = (index: number) => {
  const [img] = uploadedImages.value.splice(index, 1)
  uploadedImages.value.unshift(img)
  triggerToast('Foto sampul utama diperbarui')
}

const handleSubmit = async () => {
  if (!form.value.name) {
    errorMessage.value = 'Nama kamar harus diisi'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await $fetch(`/api/admin/rooms/${roomId}`, {
      method: 'PUT',
      body: {
        name: form.value.name,
        price: form.value.price,
        description: form.value.description,
        facilities: selectedFacilities.value,
        status: form.value.status,
        order: form.value.order,
        imageUrls: uploadedImages.value,
      },
    })

    triggerToast('Perubahan kamar berhasil disimpan! ✨')
    router.push('/admin')
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || 'Gagal menyimpan perubahan'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-5 sm:space-y-6 max-w-3xl">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <NuxtLink to="/admin" class="text-xs text-text-muted hover:text-text-main flex items-center gap-1 mb-1 transition-ui">
          <Icon name="lucide:arrow-left" class="w-3.5 h-3.5" />
          <span>Kembali ke Dashboard</span>
        </NuxtLink>
        <h2 class="font-extrabold text-lg sm:text-xl text-text-main tracking-tight">Edit Kamar: {{ form.name || 'Memuat...' }}</h2>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="bg-red-50 text-status-red text-xs p-3.5 rounded-2xl border border-red-100 flex items-center gap-2">
      <Icon name="lucide:alert-circle" class="w-4 h-4 flex-shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-5 sm:space-y-6">
      <!-- Section 1: Informasi Dasar -->
      <div class="bg-white rounded-2.5xl p-4 sm:p-6 border border-slate-100 shadow-xs space-y-4">
        <h3 class="font-bold text-sm text-text-main border-b border-slate-100 pb-2">Informasi Kamar</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          <div>
            <label class="block text-xs font-bold text-text-main mb-1.5">Nama Kamar</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-brand-yellow focus:ring-2 focus:ring-yellow-100 transition-ui min-h-[42px]"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-text-main mb-1.5">Harga Sewa per Bulan (Rp)</label>
            <input
              v-model="form.price"
              type="number"
              required
              min="0"
              step="50000"
              class="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-brand-yellow focus:ring-2 focus:ring-yellow-100 transition-ui min-h-[42px]"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-text-main mb-1.5">Status Ketersediaan</label>
          <div class="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <label class="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
              <input type="radio" value="AVAILABLE" v-model="form.status" class="accent-brand-dark" />
              <span class="text-status-green font-bold">Tersedia (Bisa Disewa)</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
              <input type="radio" value="RENTED" v-model="form.status" class="accent-brand-dark" />
              <span class="text-status-red font-bold">Tersewa / Penuh</span>
            </label>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-text-main mb-1.5">Deskripsi Lengkap Kamar</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-brand-yellow focus:ring-2 focus:ring-yellow-100 transition-ui"
          ></textarea>
        </div>
      </div>

      <!-- Section 2: Fasilitas Kamar -->
      <div class="bg-white rounded-2.5xl p-4 sm:p-6 border border-slate-100 shadow-xs space-y-4">
        <h3 class="font-bold text-sm text-text-main border-b border-slate-100 pb-2">Fasilitas Kamar</h3>
        <p class="text-xs text-text-muted">Centang fasilitas yang tersedia di kamar ini:</p>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
          <button
            type="button"
            v-for="fac in commonFacilities"
            :key="fac"
            @click="toggleFacility(fac)"
            :class="[
              'p-2.5 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-ui min-h-[44px]',
              selectedFacilities.includes(fac)
                ? 'bg-amber-50 border-amber-300 text-brand-dark font-bold'
                : 'bg-white border-slate-200 text-text-muted hover:border-slate-300'
            ]"
          >
            <span class="line-clamp-2">{{ fac }}</span>
            <Icon
              :name="selectedFacilities.includes(fac) ? 'lucide:check-circle-2' : 'lucide:circle'"
              class="w-3.5 h-3.5 text-brand-dark flex-shrink-0 ml-1"
            />
          </button>
        </div>

        <div class="pt-2 flex items-center gap-2">
          <input
            v-model="customFacility"
            type="text"
            placeholder="Tambah fasilitas khusus..."
            class="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-brand-yellow min-h-[40px]"
            @keydown.enter.prevent="addCustomFacility"
          />
          <button
            type="button"
            @click="addCustomFacility"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-text-main text-xs font-bold rounded-xl transition-ui min-h-[40px] flex-shrink-0"
          >
            Tambah
          </button>
        </div>
      </div>

      <!-- Section 3: Foto-Foto Kamar -->
      <div class="bg-white rounded-2.5xl p-4 sm:p-6 border border-slate-100 shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 class="font-bold text-sm text-text-main">Galeri Foto Kamar</h3>
          <span class="text-xs text-text-muted font-bold">{{ uploadedImages.length }} foto tersimpan</span>
        </div>

        <!-- Upload Dropzone (Mobile & Desktop) -->
        <label class="border-2 border-dashed border-slate-200 hover:border-brand-yellow rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-ui bg-slate-50/50 hover:bg-amber-50/30 text-center">
          <div class="w-12 h-12 rounded-full bg-brand-yellow/30 text-brand-dark flex items-center justify-center mb-2">
            <Icon v-if="!isUploading" name="lucide:camera" class="w-6 h-6" />
            <Icon v-else name="lucide:loader-2" class="w-6 h-6 animate-spin" />
          </div>
          <p class="text-xs font-extrabold text-text-main">
            {{ isUploading ? 'Sedang mengunggah foto baru...' : 'Ambil Foto dari Kamera HP atau Pilih dari File' }}
          </p>
          <p class="text-[10px] text-text-muted mt-1">Bisa pilih beberapa foto sekaligus (JPG, PNG, WEBP)</p>
          <input
            type="file"
            multiple
            accept="image/*"
            class="hidden"
            :disabled="isUploading"
            @change="handleFileUpload"
          />
        </label>

        <!-- Preview Uploaded Images Grid -->
        <div v-if="uploadedImages.length > 0" class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-2">
          <div
            v-for="(img, idx) in uploadedImages"
            :key="idx"
            class="relative rounded-xl overflow-hidden aspect-video border border-slate-200 group"
          >
            <img :src="img" class="w-full h-full object-cover" />
            <span
              v-if="idx === 0"
              class="absolute top-1 left-1 bg-brand-yellow text-brand-dark text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs"
            >
              Foto Utama
            </span>
            <!-- Action overlay (Touch & Hover Friendly) -->
            <div class="absolute inset-0 bg-black/50 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-ui flex items-center justify-center gap-2">
              <button
                v-if="idx !== 0"
                type="button"
                @click="setPrimaryImage(idx)"
                class="bg-white text-brand-dark px-2 py-1 rounded-md text-[10px] font-bold shadow-xs active:scale-95"
                title="Jadikan Foto Utama"
              >
                Utama
              </button>
              <button
                type="button"
                @click="removeImage(idx)"
                class="bg-red-500 text-white p-1.5 rounded-md shadow-xs active:scale-95"
                title="Hapus Foto"
              >
                <Icon name="lucide:trash" class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Buttons -->
      <div class="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3 pt-2">
        <NuxtLink
          to="/admin"
          class="w-full sm:w-auto text-center px-5 py-3 rounded-xl border border-slate-200 text-text-muted hover:text-text-main text-xs font-bold transition-ui min-h-[44px] flex items-center justify-center"
        >
          Batal
        </NuxtLink>
        <button
          type="submit"
          :disabled="isSubmitting || isUploading"
          class="w-full sm:w-auto bg-brand-dark hover:bg-brand-dark-hover text-white px-6 py-3 rounded-xl text-xs font-bold transition-ui flex items-center justify-center gap-2 shadow-md disabled:opacity-50 active:scale-95 min-h-[44px]"
        >
          <Icon v-if="isSubmitting" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan Kamar' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
