<script setup>
  defineProps(['text', 'icon']);
</script>

<template>
  <button type="button" @click.prevent class="text-white text-sm bg-primary-700 hover:bg-primary-600 px-4 py-1.5 rounded shadow">
    <div class="flex items-center space-x-1">
      <i v-if="icon" :class="icon" />
      <span>{{ text }}</span>
    </div>
  </button>
</template>