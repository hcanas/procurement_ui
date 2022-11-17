<script setup>
  defineProps(['value', 'options']);
  defineEmits(['update:value']);
</script>

<template>
  <select :value="value" @change="$emit('update:value', $event.target.value)" class="text-sm px-2 py-1.5 border rounded">
    <option v-for="option in options" :value="option.value">{{ option.label }}</option>
  </select>
</template>