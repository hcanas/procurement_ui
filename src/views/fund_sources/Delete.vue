<script setup>
  import { shallowRef, ref, onMounted } from 'vue';
  import axios from 'axios';
  
  import BtnNeutral from '../../components/buttons/Neutral.vue';
  import BtnDanger from '../../components/buttons/Danger.vue';
  import Loading from '../../components/overlays/Loading.vue';
  import Deleting from '../../components/overlays/Deleting.vue';
  
  const props = defineProps(['data']);
  const emits = defineEmits(['deleted', 'cancel']);
  
  const fund_source = ref({});

  const overlay = ref({
    show: false,
    component: '',
  });
  
  onMounted(async () => {
    overlay.value.component = shallowRef(Loading);
    overlay.value.show = true;
    
    await axios.get(`${import.meta.env.VITE_API_URL}/fund_sources/${props.data.id}`)
      .then(response => {
        fund_source.value = {
          ...response.data,
          office: props.data.offices.find(office => office.id === response.data.office_id),
        };
      });
    
    overlay.value.show = false
  });
  
  const remove = async () => {
    overlay.value.component = shallowRef(Deleting);
    overlay.value.show = true;
    
    await axios.delete(`${import.meta.env.VITE_API_URL}/fund_sources/${props.data.id}}`)
      .then(() => emits('deleted', props.data.id));
    
    overlay.value.show = false;
  };
</script>

<template>
  <div class="w-full h-full rounded-lg flex flex-col space-y-6 p-6 relative">
    <p class="text-gray-600 text-center font-medium border-b">Delete Fund Source</p>
    
    <div class="flex flex-col space-y-6">
      <div class="flex flex-col space-y-1">
        <span class="text-gray-600 text-sm font-medium">Name</span>
        <span class="text-gray-600">{{ fund_source.name }}</span>
      </div>
  
      <div class="flex flex-col space-y-1">
        <span class="text-gray-600 text-sm font-medium">Amount</span>
        <span class="text-gray-600">{{ new Intl.NumberFormat('en-PH').format(fund_source.amount) }}</span>
      </div>
  
      <div class="flex flex-col space-y-1">
        <span class="text-gray-600 text-sm font-medium">Year</span>
        <span class="text-gray-600">{{ fund_source.year }}</span>
      </div>
  
      <div class="flex flex-col space-y-1">
        <span class="text-gray-600 text-sm font-medium">Office</span>
        <span class="text-gray-600">{{ fund_source.office?.name }}</span>
      </div>
  
      <div class="flex justify-end space-x-6">
        <btn-neutral @click="$emit('cancel')" :text="'Cancel'" :icon="'fas fa-xmark'" />
        <btn-danger @click="remove" :text="'Delete'" :icon="'fas fa-trash'" />
      </div>
    </div>
  
    <component v-if="overlay.show" :is="overlay.component" />
  </div>
</template>