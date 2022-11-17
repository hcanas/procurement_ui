<script setup>
  import BtnIcon from '../buttons/Icon.vue';

  defineProps(['title']);
  defineEmits(['close']);
</script>

<template>
  <div class="flex justify-between items-center bg-primary-600 py-3 pl-6 pr-3">
    <h3 class="text-center text-white font-medium">{{ title }}</h3>
    <BtnIcon @click="$emit('close')" :icon="'fas fa-right-long'" :label="'Close'" class="text-white hover:text-gray-300" title="Close" />
  </div>
</template>