<script setup>
  defineProps(['icon']);
</script>

<template>
  <button type="button" class="w-8 h-8 rounded">
    <i :class="icon" />
  </button>
</template>