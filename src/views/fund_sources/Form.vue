<script setup>
  import { ref, watch, onMounted } from 'vue';
  import { useGate } from '../../composables/gate';
  import { useDB } from '../../composables/db';
  
  import FormGeneralError from '../../components/form_controls/GeneralError.vue';
  import FormFieldError from '../../components/form_controls/FieldError.vue';
  import FormLabel from '../../components/form_controls/Label.vue';
  import FormText from '../../components/form_controls/Text.vue';
  import FormNumber from '../../components/form_controls/Number.vue';
  import FormSelect from '../../components/form_controls/Select.vue';
  import BtnPrimary from '../../components/buttons/Primary.vue';
  import Loading from '../../components/loaders/Loading.vue';
  import Saving from '../../components/loaders/Saving.vue';
  
  const props = defineProps(['data']);
  const emits = defineEmits(['created', 'updated', 'alert']);

  const { getOffices } = useGate();
  const { getRecord, createRecord, updateRecord } = useDB();
  
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
  
  const overlay = ref('');

  if (props.data.id) {
    overlay.value = 'loading';
    await getRecord(`${import.meta.env.VITE_API_URL}/fund_sources/${props.data.id}`, response => form_data.value = response.data);
    overlay.value = '';
  }

  getRecord(`${import.meta.env.VITE_PORTAL_API_URL}/offices`, response => {
    const temp_offices = getOffices(['fund_sources:manage', props.data.id ? 'fund_sources:update' : 'fund_sources:create']);
    
    response.data.forEach(office => {
      if (temp_offices.includes(office.id)) {
        form_options.value.offices.push({
          value: office.id,
          label: office.name + ' (' + office.short_name + ')',
        });
      }
    });

    if (props.data.id === undefined) form_data.value.office_id = form_options.value.offices[0].value;
  });
  
  const save = async () => {
    form_errors.value = [];
    overlay.value = 'saving';
    
    if (form_data.value.id) {
      await updateRecord(`${import.meta.env.VITE_API_URL}/fund_sources/${form_data.value.id}`, form_data.value, response => {
          emits('updated', response.data);
          emits('alert', {
            type: 'success',
            message: 'Fund source has been updated.',
          });
      }, error => {
        if (error.response.status === 400) {
          form_errors.value = error.response.data;
        }
      });
    } else {
      await createRecord(`${import.meta.env.VITE_API_URL}/fund_sources`, form_data.value, response => {
        emits('created', response.data);
          emits('alert', {
            type: 'success',
            message: 'Fund source has been created.',
          });
      }, error => {
        if (error.response.status === 400) {
          form_errors.value = error.response.data;
        }
      });
    }
    
    overlay.value = '';
  };
</script>

<template>
  <div class="w-full h-full relative">
    <div class="flex flex-col space-y-6 p-6">  
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
        </div>
      </form>

      <div class="text-right">
        <BtnPrimary @click="save" :icon="'fas fa-save'" :text="'Save'" title="Save" />
      </div>
    </div>
    
    <Saving v-if="overlay === 'saving'" />
    <Loading v-if="overlay === 'loading'" />
  </div>
</template>