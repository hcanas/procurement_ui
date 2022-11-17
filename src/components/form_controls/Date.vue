<script setup>
  import 'v-calendar/dist/style.css';
  import { DatePicker } from 'v-calendar';
  
  defineProps(['value']);
  defineEmits(['update:value']);
</script>

<template>
  <date-picker :modelValue="value" @update:modelValue="val => $emit('update:value', val?.toLocaleString())" mode="date" :model-config="{ type: 'string', mask: 'YYYY-MM-DD' }" :masks="{ L: 'YYYY-MM-DD' }">
    <template v-slot="{ inputValue, togglePopover }">
      <input type="date" @click="togglePopover" lang="en-US" :value="inputValue" class="w-full text-sm px-2 py-1.5 border rounded" readonly />
    </template>
  </date-picker>
</template>

<style scoped>
  input {
    -webkit-appearance: none;
    appearance: none;
  }
</style>