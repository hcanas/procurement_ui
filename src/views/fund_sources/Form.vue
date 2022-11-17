<script setup>
  import {  ref, watch, onMounted } from 'vue';
  import axios from 'axios';
  
  import FormGeneralError from '../../components/form_controls/GeneralError.vue';
  import FormFieldError from '../../components/form_controls/FieldError.vue';
  import FormLabel from '../../components/form_controls/Label.vue';
  import FormText from '../../components/form_controls/Text.vue';
  import FormNumber from '../../components/form_controls/Number.vue';
  import FormSelect from '../../components/form_controls/Select.vue';
  import BtnPrimary from '../../components/buttons/Primary.vue';
  import BtnNeutral from '../../components/buttons/Neutral.vue';
  import Loading from '../../components/overlays/Loading.vue';
  import Saving from '../../components/overlays/Saving.vue';
  
  const props = defineProps(['data']);
  const emits = defineEmits(['cancel', 'created', 'updated']);
  
  const form_data = ref({
    name: '',
    amount: 0,
    year: new Date().getFullYear(),
    office_id: null,
  });
  
  const form_options = ref({
    offices: [],
  });
  
  const form_errors = ref([]);
  
  const overlay = ref({
    show: false,
    component: '',
  });
  
  const loadFundSource = async id => {
    overlay.value.component = shallowRef(Loading);
    overlay.value.show = true;
    
    await axios.get(`${import.meta.env.VITE_API_URL}/fund_sources/${id}`)
      .then(response => form_data.value = response.data);
  
    overlay.value.show = false;
  };
  
  const save = async () => {
    form_errors.value = [];
    overlay.value.component = shallowRef(Saving);
    overlay.value.show = true;
  
    axios.interceptors.response.use(response => response, error => {
      if (error.response.status === 400) {
        form_errors.value = error.response.data;
      }
  
      return Promise.reject(error);
    });
    
    if (form_data.value.id) {
      await axios.put(`${import.meta.env.VITE_API_URL}/fund_sources/${form_data.value.id}`, form_data.value)
        .then(response => emits('updated', response.data));
    } else {
      await axios.post(`${import.meta.env.VITE_API_URL}/fund_sources`, form_data.value)
        .then(response => emits('created', response.data));
    }
    
    overlay.value.show = false;
  };
  
  onMounted(async () => {
    form_options.value.offices = props.data.offices.map(office => {
          return {
            value: office.id,
            label: office.name + ' (' + office.short_name + ')',
          }
        });
    
    if (props.data.id) {
      await loadFundSource(props.data.id);
    } else {
      form_data.value.office_id = form_options.value.offices[0].value;
    }
  });
  
  watch(() => props.data.id, id => {
    loadFundSource(id);
  });
</script>

<template>
  <div class="w-full h-full relative">
    <div class="flex flex-col space-y-6 p-6">
      <p class="text-gray-600 text-center font-medium border-b">{{ props.data.id ? 'Update Fund Source' : 'Create Fund Source' }}</p>
  
      <form-general-error v-if="form_errors.hasOwnProperty('general')" :text="form_errors.general" />
  
      <form @submit.prevent>
        <div class="flex flex-col space-y-6">
          <div class="flex flex-col space-y-1">
            <form-label :text="'Name'" />
            <form-text v-model:value="form_data.name" />
            <form-field-error v-if="form_errors.hasOwnProperty('name')" :text="form_errors.name[0]" />
          </div>
      
          <div class="flex flex-col space-y-1">
            <form-label :text="'Amount'" />
            <form-number v-model:value="form_data.amount" />
            <form-field-error v-if="form_errors.hasOwnProperty('amount')" :text="form_errors.amount[0]" />
          </div>
      
          <div class="flex flex-col space-y-1">
            <form-label :text="'Year'" />
            <form-number v-model:value="form_data.year" />
            <form-field-error v-if="form_errors.hasOwnProperty('year')" :text="form_errors.year[0]" />
          </div>
      
          <div class="flex flex-col space-y-1">
            <form-label :text="'Office'" />
            <form-select v-model:value="form_data.office_id" :options="form_options.offices" />
            <form-field-error v-if="form_errors.hasOwnProperty('office_id')" :text="form_errors.office_id[0]" />
          </div>
      
          <div class="flex justify-end space-x-6">
            <btn-neutral @click="$emit('cancel')" :text="'Cancel'" :icon="'fas fa-xmark'" />
            <btn-primary @click="save" :text="'Save'" :icon="'fas fa-save'" />
          </div>
        </div>
      </form>
    </div>
    
    <component v-if="overlay.show" :is="overlay.component" />
  </div>
</template>