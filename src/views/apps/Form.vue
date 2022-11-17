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
  import Loading from '../../components/overlays/Loading.vue';
  import Saving from '../../components/overlays/Saving.vue';
  
  const props = defineProps(['id']);
  const emits = defineEmits(['cancel', 'created', 'updated']);

  const office_ids = JSON.parse(Cookies.get('auth_permissions') ?? [])
    .find(permission => permission.n === 'apps:manage')?.o ?? [];

  const form_options = ref({
    offices: [],
    years: [
      { label: 2022, value: 2022 },
      { label: 2023, value: 2023 },
      { label: 2024, value: 2024 },
      { label: 2025, value: 2025 },
    ],
    wfps: [],
    items: [],
    procurement_modes: [
      { value: 'Public Bidding', label: 'Public Bidding' },
      { value: 'Shopping', label: 'Shopping' },
    ],
  });
  
  const form_data = ref({
    code: null,
    ppmp_id: null,
    end_user: 'DOH-CHD-CAR',
    procurement_mode: form_options.value.procurement_modes[0].value,
    advertisement_date: '',
    opening_date: '',
    noa_date: '',
    signing_data: '',
    ppmp: {
      wfp: {
        fund_source: {
          office_id: null,
          year: form_options.value.years[0].value,
        },
      },
    },
  });
  
  const form_errors = ref([]);
  
  const overlay = ref({
    show: false,
    component: '',
  });
  
  const loadWfps = async (year, office_id) => {
    await axios.get(`${import.meta.env.VITE_API_URL}/approved_wfps?year=${year}&office_id=${office_id}`)
      .then(response => {
        form_options.value.wfps = response.data.map(wfp => {
          return {
            label: wfp,
            value: wfp.id,
          }
        });
      });
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
      await axios.put(`${import.meta.env.VITE_API_URL}/ppmps/${form_data.value.id}`, form_data.value)
        .then(response => emits('updated', response.data));
    } else {
      await axios.post(`${import.meta.env.VITE_API_URL}/ppmps`, form_data.value)
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
      await axios.get(`${import.meta.env.VITE_API_URL}/ppmps/${props.id}`)
        .then(response => form_data.value = response.data);
    } else {
      form_data.value.ppmp.wfp.fund_source.office_id = form_options.value.offices[0].value;
    }
    
    axios.get(`${import.meta.env.VITE_PORTAL_API_URL}/users`)
      .then(response => form_options.value.responsible_persons = response.data.map(user => {
        return {
          label: user.name,
          value: user.id,
        }
      }));
  
    await loadWfps(form_data.value.ppmp.wfp.fund_source.year, form_data.value.ppmp.wfp.fund_source.office_id);
  
    await axios.get(`${import.meta.env.VITE_API_URL}/items`)
      .then(response => form_options.value.items = response.data.map(item => {
        return {
          value: item.id,
          label: item,
        }
      }));
  
    watch(() => form_data.value.ppmp.wfp.fund_source?.office_id + form_data.value.ppmp.wfp.fund_source?.year, async () => {
      overlay.value.component = shallowRef(Loading);
      overlay.value.show = true;
      await loadWfps(form_data.value.ppmp.wfp.fund_source.year, form_data.value.ppmp.wfp.fund_source.office_id);
      overlay.value.show = false;
    });
  });
</script>

<template>
  <div class="w-full h-full relative">
    <div class="flex flex-col space-y-6 max-h-full overflow-y-auto p-6">
      <p class="text-gray-600 text-center font-medium border-b">{{ props.id ? 'Update PPMP' : 'Create PPMP' }}</p>
  
      <form-general-error v-if="form_errors.hasOwnProperty('general')" :text="form_errors.general" />
  
      <form @submit.prevent>
        <div class="flex flex-col space-y-6">
          <div class="flex flex-col space-y-1">
            <form-label :text="'Office'" />
            <form-select v-model:value="form_data.ppmp.wfp.fund_source.office_id" :options="form_options.offices" />
            <form-field-error v-if="form_errors.ppmp?.wfp?.fund_source?.hasOwnProperty('office_id')" :text="form_errors.ppmp.wfp.fund_source.office_id[0]" />
          </div>
  
          <div class="flex flex-col space-y-1">
            <form-label :text="'Year'" />
            <form-select v-model:value="form_data.ppmp.wfp.fund_source.year" :options="form_options.years" />
            <form-field-error v-if="form_errors.ppmp?.wfp?.fund_source?.hasOwnProperty('year')" :text="form_errors.ppmp.wfp.fund_source.year[0]" />
          </div>
          
          <div class="flex-grow flex flex-col">
            <form-label :text="'WFP'" />
            <form-suggestion v-model:value="form_data.wfp_id" :options="form_options.wfps">
              <template #format="{ value }">
                <div class="flex flex-col space-y-1 text-sm">
                  <span class="font-medium">{{ value.code }}</span>
                  <span>{{ value.item }}</span>
                  <span>
                    {{ new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                        .format(new Date(value.timeframe_from))
                        + ' - '
                        + new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                          .format(new Date(value.timeframe_to)) }}
                  </span>
                  <span>{{ new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value.cost - value.allocated) }}</span>
                </div>
              </template>
            </form-suggestion>
            <form-field-error v-if="form_errors.hasOwnProperty('wfp_id')" :text="form_errors.wfp_id[0]" />
          </div>
  
          <div class="flex flex-col space-y-1">
            <form-label :text="'Procurement Mode'" />
            <form-select v-model:value="form_data.procurement_mode" :options="form_options.procurement_modes" />
            <form-field-error v-if="form_errors.hasOwnProperty('procurement_mode')" :text="form_errors.procurement_mode[0]" />
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