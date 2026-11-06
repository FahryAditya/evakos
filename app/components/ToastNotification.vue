<script setup lang="ts">
const { show, message } = useToast()
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
    enter-from-class="transform translate-y-8 scale-90 opacity-0"
    enter-to-class="transform translate-y-0 scale-100 opacity-100"
    leave-active-class="transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]"
    leave-from-class="transform translate-y-0 scale-100 opacity-100"
    leave-to-class="transform translate-y-6 scale-95 opacity-0"
  >
    <div
      v-if="show"
      class="fixed bottom-6 right-6 z-50 bg-brand-dark/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700/60 pointer-events-auto"
    >
      <div class="relative flex items-center justify-center">
        <span class="w-2.5 h-2.5 rounded-full bg-brand-yellow"></span>
        <span class="absolute w-2.5 h-2.5 rounded-full bg-brand-yellow animate-ping"></span>
      </div>
      <span class="tracking-wide">{{ message }}</span>
    </div>
  </Transition>
</template>
