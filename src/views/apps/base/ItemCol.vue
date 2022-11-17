<script setup>
  defineProps(['params']);
</script>

<template>
  <div class="w-full flex flex-col">
    <span class="font-bold">{{ params.value.title }}</span>
    <span class="italic">{{ params.value.category.name }}</span>
    <span>{{ params.value.commodity_type }}</span>
    <span>{{ params.value.details }}</span>
  </div>
</template>