<script setup lang="ts">
// Main root application
</script>

<template>
  <div class="min-h-screen bg-canvas text-text-main flex flex-col font-sans selection:bg-brand-yellow selection:text-brand-dark">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastNotification />
  </div>
</template>
