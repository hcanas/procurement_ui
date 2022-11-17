<script setup>
  defineProps(['label'])
</script>

<template>
  <span class="text-sm text-white font-medium uppercase bg-red-600 px-2 py-0.5 rounded-lg shadow">{{ label }}</span>
</template>