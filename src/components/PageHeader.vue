<script setup>
  defineProps(['title'])
</script>

<template>
  <div class="w-full flex justify-between items-center pb-6">
    <h1 class="text-2xl text-gray-600 font-bold">{{ title }}</h1>
    <slot name="controls">
      <div></div>
    </slot>
  </div>
</template>