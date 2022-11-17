<script setup>
  defineProps(['params']);
</script>

<template>
  <span v-if="params.value === 'approved'" class="text-xs text-green-600 uppercase italic">{{ params.value }}</span>
  <span v-else-if="params.value === 'rejected'" class="text-xs text-red-600 uppercase italic">{{ params.value }}</span>
  <span v-else class="text-xs text-gray-500 uppercase italic">{{ params.value }}</span>
</template>