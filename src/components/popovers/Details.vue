<script setup>
  import { ref, onMounted } from 'vue';
  import BtnIcon from '../buttons/Icon.vue';

  defineProps(['title']);
  defineEmits(['close']);

  const box = ref(null);

  const start_x = ref(0);
  const start_y = ref(0);
  const offset_x = ref(0);
  const offset_y = ref(0);

  onMounted(() => {
    box.value.addEventListener('dragstart', event => {
      start_x.value = event.offsetX;
      start_y.value = event.offsetY;
    });

    box.value.addEventListener('dragend', event => {
      offset_x.value += (event.offsetX - start_x.value);
      offset_y.value += (event.offsetY - start_y.value);

      box.value.style.left = offset_x.value + 'px';
      box.value.style.top = offset_y.value + 'px';
    })
  });
</script>

<template>
  <div ref="box" draggable="true" class="absolute top-32 left-96 w-96 flex flex-col bg-gray-100 rounded shadow-lg z-50">
    <div class="flex justify-between items-center bg-primary-600 py-3 pl-6 pr-3 rounded-t">
      <h3 class="text-center text-white font-medium">{{ title }}</h3>
      <BtnIcon @click="$emit('close')" :icon="'fas fa-xmark'" :label="'Close'" class="text-white hover:text-gray-300" title="Close" />
    </div>
    <div class="border border-primary-600 rounded-b">
      <slot></slot>
    </div>
  </div>
</template>