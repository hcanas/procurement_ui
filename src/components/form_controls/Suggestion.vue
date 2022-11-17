<script setup>
  import { ref, watch } from 'vue';
  
  const props = defineProps(['value', 'options']);
  const emits = defineEmits(['update:value']);
  
  const suggestions = ref(null);
  const selected = ref(null);
  const filter = ref('');
  
  const setSelected = value => {
    selected.value = props.options.find(x => x.value === value);
    emits('update:value', value);
  }
  
  const clearSelected = () => {
    selected.value = null;
    emits('update:value', null);
  };

  watch(() => props.options, options => {
    if (props.value) selected.value = options.find(x => x.value = props.value);
  });
  
  watch(() => filter.value, filter => {
    if (filter && filter.length > 0) {
      suggestions.value = props.options.filter(x => {
        if (typeof x.label === 'string') return x.label.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
        else return JSON.stringify(x.label).toLowerCase().indexOf(filter.toLowerCase()) > 0;
      }).slice(0, 5);
    } else {
      suggestions.value = null;
    }
  });
</script>

<template>
  <div v-if="selected === null" class="w-full flex flex-col relative">
    <input type="text" v-model="filter" class="text-sm px-2 py-1.5 border rounded" />
    <div v-if="suggestions" class="absolute top-9 inset-x-0 flex flex-col space-y-6 max-h-96 overflow-y-auto bg-gray-300 p-2 z-50">
      <span v-for="option in suggestions" @click="setSelected(option.value)" :key="option.value" class="text-gray-600 hover:text-primary-600 cursor-pointer">
        <slot name="format" :value="option.label">
          {{ option.label }}
        </slot>
      </span>
    </div>
  </div>
  <div v-else class="flex flex-col space-y-1">
    <slot name="format" :value="selected.label">
      <span>{{ selected.label }}</span>
    </slot>
    <span>
      <button type="button" @click="clearSelected" class="text-xs uppercase text-primary-600 hover:text-primary-500 hover:underline font-medium">Change</button>
    </span>
  </div>
</template>