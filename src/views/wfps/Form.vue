<script setup>
  import { shallowRef, ref, watch, onMounted } from 'vue';
  import axios from 'axios';
  import Cookies from 'js-cookie';
  
  import FormGeneralError from '../../components/form_controls/GeneralError.vue';
  import FormFieldError from '../../components/form_controls/FieldError.vue';
  import FormLabel from '../../components/form_controls/Label.vue';
  import FormStatic from '../../components/form_controls/Static.vue';
  import FormText from '../../components/form_controls/Text.vue';
  import FormTextArea from '../../components/form_controls/TextArea.vue';
  import FormNumber from '../../components/form_controls/Number.vue';
  import FormDate from '../../components/form_controls/Date.vue';
  import FormSelect from '../../components/form_controls/Select.vue';
  import FormSuggestion from '../../components/form_controls/Suggestion.vue';
  import BtnPrimary from '../../components/buttons/Primary.vue';
  import BtnNeutral from '../../components/buttons/Neutral.vue';
  import Loading from '../../components/loaders/Loading.vue';
  import Saving from '../../components/loaders/Saving.vue';
  
  const props = defineProps(['id']);
  const emits = defineEmits(['cancel', 'created', 'updated']);

  const office_ids = JSON.parse(Cookies.get('auth_permissions') ?? [])
    .find(permission => permission.n === 'wfps:manage')?.o ?? [];

  const form_options = ref({
    function_types: [
      { label: 'Core', value: 'Core' },
      { label: 'Support', value: 'Support' },
      { label: 'Strategy', value: 'Strategy' },
    ],
    offices: [],
    years: [
      { label: 2022, value: 2022 },
      { label: 2023, value: 2023 },
      { label: 2024, value: 2024 },
      { label: 2025, value: 2025 },
    ],
    fund_sources: [],
    responsible_persons: [],
  });
  
  const form_data = ref({
    code: '',
    function_type: form_options.value.function_types[0].value,
    deliverables: '',
    activities: '',
    timeframe_from: new Date().getFullYear() + '-01-01',
    timeframe_to:  new Date().getFullYear() + '-12-31',
    target_q1: 0,
    target_q2: 0,
    target_q3: 0,
    target_q4: 0,
    item: '',
    cost: 0,
    fund_source_id: null,
    responsible_person_id: null,
    fund_source: {
      office_id: null,
      year: new Date().getFullYear(),
    },
  });
  
  const form_errors = ref([]);
  
  const overlay = ref({
    show: false,
    component: '',
  });
  
  const loadFundSources = async (year, office_id) => {
    await axios.get(`${import.meta.env.VITE_API_URL}/fund_sources?year=${year}&office_id=${office_id}`)
      .then(response => {
        form_options.value.fund_sources = response.data.map(fund_source => {
          return {
            label: fund_source.name
              + ' '
              + new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })
              .format(fund_source.amount - fund_source.allocated),
            value: fund_source.id,
          }
        });
      });
    
    form_data.value.fund_source_id = form_options.value.fund_sources.find(({ value }) => value === form_data.value.fund_source_id)
      ? form_data.value.fund_source_id
      : form_options.value.fund_sources[0]?.value ?? '';
  };
  
  const save = async () => {
    form_errors.value = [];
    overlay.value.component = shallowRef(Saving);
    overlay.value.show = true;
    
    axios.interceptors.response.use(response => response, error => {
      if (error.response.status === 400) {
        form_errors.value = error.response.data;
        overlay.value.show = false;
      }
      
      return Promise.reject(error);
    });
    
    if (form_data.value.id) {
      await axios.put(`${import.meta.env.VITE_API_URL}/wfps/${form_data.value.id}`, form_data.value)
        .then(response => emits('updated', response.data));
    } else {
      await axios.post(`${import.meta.env.VITE_API_URL}/wfps`, form_data.value)
        .then(response => emits('created', response.data));
    }
    
    overlay.value.show = false;
  };
  
  onMounted(async () => {
    await axios.get(`${import.meta.env.VITE_PORTAL_API_URL}/offices`)
      .then(response =>{
        response.data.forEach(office => {
          if (office_ids.includes(office.id)) {
            form_options.value.offices.push({
              value: office.id,
              label: office.name,
            })
          }
        });
      });
    
    if (props.id) {
      await axios.get(`${import.meta.env.VITE_API_URL}/wfps/${props.id}`)
        .then(response => form_data.value = response.data);
    } else {
      form_data.value.fund_source.office_id = form_options.value.offices[0].value;
    }
    
    axios.get(`${import.meta.env.VITE_PORTAL_API_URL}/users`)
      .then(response => form_options.value.responsible_persons = response.data.map(user => {
        return {
          label: user.name,
          value: user.id,
        }
      }));
  
    await loadFundSources(form_data.value.fund_source.year, form_data.value.fund_source.office_id);
  });

  watch(() => form_data.value.fund_source?.office_id + form_data.value.fund_source?.year, async () => {
    overlay.value.component = shallowRef(Loading);
    overlay.value.show = true;
    await loadFundSources(form_data.value.fund_source.year, form_data.value.fund_source.office_id);
    overlay.value.show = false;
  });
</script>

<template>
  <div class="w-full h-full relative">
    <div class="flex flex-col space-y-6 max-h-full overflow-y-auto p-6">
      <p class="text-gray-600 text-center font-medium border-b">{{ props.id ? 'Update WFP' : 'Create WFP' }}</p>
  
      <form-general-error v-if="form_errors.hasOwnProperty('general')" :text="form_errors.general" />
  
      <form @submit.prevent>
        <div class="flex flex-col space-y-6">
          <div class="flex items-center space-x-6">
            <div v-if="form_data.code" class="flex-grow flex flex-col space-y-1">
              <form-label :text="'Code'" />
              <form-static :value="form_data.code" />
            </div>
  
            <div class="flex-grow flex flex-col space-y-1">
              <form-label :text="'Function Type'" />
              <form-select v-model:value="form_data.function_type" :options="form_options.function_types" />
              <form-field-error v-if="form_errors.hasOwnProperty('function_type')" :text="form_errors.function_type[0]" />
            </div>
          </div>
  
          <div class="flex flex-col space-y-1">
            <form-label :text="'Deliverables'" />
            <form-text-area v-model:value="form_data.deliverables" class="h-24" />
            <form-field-error v-if="form_errors.hasOwnProperty('deliverables')" :text="form_errors.deliverables[0]" />
          </div>
  
          <div class="flex flex-col space-y-1">
            <form-label :text="'Activities'" />
            <form-text-area v-model:value="form_data.activities" class="h-24" />
            <form-field-error v-if="form_errors.hasOwnProperty('activities')" :text="form_errors.activities[0]" />
          </div>
  
          <div class="flex flex-col space-y-1">
            <form-label :text="'Timeframe'" />
            <div class="flex items-center space-x-4">
              <div class="flex-grow flex flex-col space-y-1">
                <form-date v-model:value="form_data.timeframe_from" />
                <form-field-error v-if="form_errors.hasOwnProperty('timeframe_from')" :text="form_errors.timeframe_from[0]" />
              </div>
              
              <span>&mdash;</span>
  
              <div class="flex-grow flex flex-col space-y-1">
                <form-date v-model:value="form_data.timeframe_to" />
                <form-field-error v-if="form_errors.hasOwnProperty('timeframe_to')" :text="form_errors.timeframe_to[0]" />
              </div>
            </div>
          </div>
          
          <div class="flex flex-col space-y-1">
            <form-label :text="'Targets'" />
            <div class="grid grid-cols-4 gap-6">
              <div class="flex flex-col space-y-1">
                <form-text v-model:value="form_data.target_q1" placeholder="Q1" />
                <form-field-error v-if="form_errors.hasOwnProperty('target_q1')" :text="form_errors.target_q1[0]" />
              </div>
              
              <div class="flex flex-col space-y-1">
                <form-text v-model:value="form_data.target_q2" placeholder="Q2" />
                <form-field-error v-if="form_errors.hasOwnProperty('target_q2')" :text="form_errors.target_q2[0]" />
              </div>
              
              <div class="flex flex-col space-y-1">
                <form-text v-model:value="form_data.target_q3" placeholder="Q3" />
                <form-field-error v-if="form_errors.hasOwnProperty('target_q3')" :text="form_errors.target_q3[0]" />
              </div>
              
              <div class="flex flex-col space-y-1">
                <form-text v-model:value="form_data.target_q4" placeholder="Q4" />
                <form-field-error v-if="form_errors.hasOwnProperty('target_q4')" :text="form_errors.target_q4[0]" />
              </div>
            </div>
          </div>
  
          <div class="flex flex-col space-y-1">
            <form-label :text="'Item'" />
            <form-text-area v-model:value="form_data.item" class="h-24" />
            <form-field-error v-if="form_errors.hasOwnProperty('item')" :text="form_errors.item[0]" />
          </div>
  
          <div class="flex flex-col space-y-1">
            <form-label :text="'Cost'" />
            <form-number v-model:value="form_data.cost" />
            <form-field-error v-if="form_errors.hasOwnProperty('cost')" :text="form_errors.cost[0]" />
          </div>
  
          <div class="flex flex-col space-y-1">
            <form-label :text="'Office'" />
            <form-select v-model:value="form_data.fund_source.office_id" :options="form_options.offices" />
            <form-field-error v-if="form_errors.fund_source?.hasOwnProperty('office_id')" :text="form_errors.fund_source.office_id[0]" />
          </div>
  
          <div class="flex flex-col space-y-1">
            <form-label :text="'Year'" />
            <form-select v-model:value="form_data.fund_source.year" :options="form_options.years" />
            <form-field-error v-if="form_errors.fund_source?.hasOwnProperty('year')" :text="form_errors.fund_source.year[0]" />
          </div>
  
          <div class="flex flex-col space-y-1">
            <form-label :text="'Fund Source'" />
            <form-select v-model:value="form_data.fund_source_id" :options="form_options.fund_sources" />
            <form-field-error v-if="form_errors.hasOwnProperty('fund_source_id')" :text="form_errors.fund_source_id[0]" />
          </div>
  
          <div class="flex flex-col space-y-1">
            <form-label :text="'Responsible Person'" />
            <form-suggestion v-model:value="form_data.responsible_person_id" :options="form_options.responsible_persons" />
            <form-field-error v-if="form_errors.hasOwnProperty('responsible_person_id')" :text="form_errors.responsible_person_id[0]" />
          </div>
      
          <div class="flex justify-end space-x-6">
            <btn-neutral @click="$emit('cancel', props.id)" :text="'Cancel'" :icon="'fas fa-xmark'" />
            <btn-primary @click="save" :text="'Save'" :icon="'fas fa-save'" />
          </div>
        </div>
      </form>
    </div>
    
    <component v-if="overlay.show" :is="overlay.component" />
  </div>
</template>