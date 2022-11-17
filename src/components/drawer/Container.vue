<script setup>
  defineProps(['show', 'controls']);
</script>

<template>
  <div class="h-full overflow-hidden rounded-lg transition-[width] duration-300" :class="{ 'w-[28rem] bg-white border shadow': show, 'w-0': !show }">
    <slot></slot>
  </div>
</template>