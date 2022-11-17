<script setup>
  defineProps(['value']);
  defineEmits(['update:value']);
</script>

<template>
  <textarea :value="value" @input="$emit('update:value', $event.target.value)" class="text-sm px-2 py-1.5 border rounded"></textarea>
</template>