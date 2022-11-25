<script setup>
  import BtnIcon from '../../components/buttons/Icon.vue';

  defineProps(['message']);
  defineEmits(['close']);
</script>

<template>
  <div class="absolute top-6 right-6 z-50 w-[28rem] bg-white p-1.5 rounded-lg shadow">
    <div class="flex justify-between items-stretch space-x-3">
      <span class="border-2 border-red-600 rounded"></span>
      <span class="flex-grow flex flex-col py-1">
        <span class="font-medium text-red-600">Error!</span>
        <span class="text-gray-600">{{ message }}</span>
      </span>
      <span class="flex-shrink-0 flex items-center">
        <BtnIcon @click="$emit('close')" :icon="'fas fa-xmark'" class="hover:text-gray-500" title="Close" />
      </span>
    </div>
  </div>
</template>