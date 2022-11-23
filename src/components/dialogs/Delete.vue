<script setup>
  import BtnNeutral from '../../components/buttons/Neutral.vue';
  import BtnDanger from '../../components/buttons/Danger.vue';

  defineProps(['show']);
  defineEmits(['cancel', 'confirm']);
</script>

<template>
  <div class="w-full flex flex-col items-center space-y-3 bg-red-50 p-6 rounded">
    <span class="text-red-600 font-medium">You are about to delete this record. Proceed?</span>
    <span class="flex space-x-3">
      <BtnNeutral @click="$emit('cancel')" :icon="'fas fa-xmark'" :text="'Cancel'" />
      <BtnDanger @click="$emit('confirm')" :icon="'fas fa-check'" :text="'Confirm'" />
    </span>
  </div>
</template>