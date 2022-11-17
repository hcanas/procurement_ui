<script setup>
  defineProps(['params']);
</script>

<template>
  <button @click="params.clicked(params.data.id)" title="More Details"><i class="fas fa-eye text-gray-400 hover:text-gray-700" /></button>
</template>