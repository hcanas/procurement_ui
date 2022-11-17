<script setup>
  defineProps(['icon', 'label']);
</script>

<template>
  <button class="text-xs text-gray-400 hover:text-gray-700 transition-colors duration-200">
    <div class="flex items-center space-x-1">
      <i :class="icon" />
      <span>{{ label }}</span>
    </div>
  </button>
</template>