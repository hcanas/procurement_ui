<script setup>
  defineProps(['params']);
</script>

<template>
  <div class="w-full h-full text-center">
    <button @click="params.clicked(params.data.id)" title="View"><i class="fas fa-eye text-gray-400 hover:text-gray-700" /></button>
  </div>
</template>