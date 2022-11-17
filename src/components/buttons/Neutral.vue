<script setup>
  defineProps(['text', 'icon']);
</script>

<template>
  <button type="button" @click.prevent class="text-gray-600 text-sm hover:bg-gray-200 px-4 py-1.5 rounded">
    <div class="flex items-center space-x-1">
      <i v-if="icon" :class="icon" />
      <span>{{ text }}</span>
    </div>
  </button>
</template>