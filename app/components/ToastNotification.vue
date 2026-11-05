<script setup lang="ts">
const { show, message } = useToast()
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-5 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-5 opacity-0"
  >
    <div
      v-if="show"
      class="fixed bottom-6 right-6 z-50 bg-brand-dark text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700/60 pointer-events-auto"
    >
      <span class="w-2 h-2 rounded-full bg-brand-yellow animate-pulse"></span>
      <span>{{ message }}</span>
    </div>
  </Transition>
</template>

