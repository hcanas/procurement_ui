<script setup>

</script>

<template>
  <div class="w-full h-full flex flex-col bg-white overflow-y-auto">
    <div class="flex-shrink-0 flex justify-between items-center bg-white px-12 shadow z-50">
      <div class="flex-shrink-0">
        <span class="text-lg text-gray-700 font-bold">Procurement Planning Information System (PPIS)</span>
      </div>
      <div class="flex-grow flex justify-end items-center space-x-6">
        <router-link :to="{ name: 'dashboard' }">Dashboard</router-link>
        <router-link :to="{ name: 'fund sources' }">Fund Sources</router-link>
        <router-link :to="{ name: 'wfps' }">WFPs</router-link>
        <router-link :to="{ name: 'ppmps' }">PPMPs</router-link>
        <router-link :to="{ name: 'apps' }">APPs</router-link>
      </div>
    </div>
    <div class="flex-grow bg-primary-100 h-full max-h-full overflow-hidden px-6 pt-12 pb-6">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
  a {
    @apply text-gray-400 font-medium px-2 py-4 border-b-2 border-b-white transition
  }
  
  a.router-link-active,
  a:hover {
    @apply text-gray-700 border-b-purple-700
  }
</style>