<script setup>
</script>

<template>
  <suspense>
    <router-view v-slot="{ Component }">
      <transition name="fade">
        <component :key="$route.fullPath" :is="Component" />
      </transition>
    </router-view>
  </suspense>
</template>

<style>
  .fade-enter-active,
  .fade-leave-active {
    @apply transition-all
  }
  
  .fade-enter-from,
  .fade-leave-to {
    @apply opacity-0
  }
</style>