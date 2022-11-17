<script setup>
  defineProps(['value']);
  defineEmits(['update:value']);
</script>

<template>
  <input type="number" :value="value" @input="$emit('update:value', $event.target.value)" class="text-sm px-2 py-1.5 border rounded" />
</template>

<style scoped>
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    appearance: none;
    margin: 0;
  }
</style>