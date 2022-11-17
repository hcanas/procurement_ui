<script setup>
  defineProps(['text']);
</script>

<template>
  <div class="text-red-600 text-sm bg-red-50 border border-red-200 p-4 rounded">{{ text }}</div>
</template>