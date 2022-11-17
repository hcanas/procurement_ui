<script setup>
  import BtnNeutral from '../../../components/buttons/Neutral.vue';
  import BtnDanger from '../../../components/buttons/Danger.vue';
  
  defineProps(['wfp']);
  defineEmits(['cancel', 'confirm']);
</script>

<template>
  <div class="flex justify-between items-center space-y-4 bg-white p-4 rounded-lg">
    <span class="text-red-600 text-sm uppercase font-medium">Delete this WFP?</span>
    <span class="flex items-center space-x-4">
        <btn-neutral @click="$emit('cancel')" :text="'Cancel'" :icon="'fas fa-xmark'" />
        <btn-danger @click="$emit('confirm')" :text="'Delete'" :icon="'fas fa-trash'" />
    </span>
  </div>
</template>