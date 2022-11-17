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
    .find(permission => permission.n === 'ppmps:manage')?.o ?? [];

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
    wfp_id: null,
    item_id: null,
    quantity: 0,
    unit: '',
    abc: 0.00,
    procurement_mode: form_options.value.procurement_modes[0].value,
    milestone_1: 0,
    milestone_2: 0,
    milestone_3: 0,
    milestone_4: 0,
    milestone_5: 0,
    milestone_6: 0,
    milestone_7: 0,
    milestone_8: 0,
    milestone_9: 0,
    milestone_10: 0,
    milestone_11: 0,
    milestone_12: 0,
    wfp: {
      fund_source: {
        office_id: null,
        year: new Date().getFullYear(),
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
      form_data.value.wfp.fund_source.office_id = form_options.value.offices[0].value;
    }
    
    axios.get(`${import.meta.env.VITE_PORTAL_API_URL}/users`)
      .then(response => form_options.value.responsible_persons = response.data.map(user => {
        return {
          label: user.name,
          value: user.id,
        }
      }));
  
    await loadWfps(form_data.value.wfp.fund_source.year, form_data.value.wfp.fund_source.office_id);
  
    await axios.get(`${import.meta.env.VITE_API_URL}/items`)
      .then(response => form_options.value.items = response.data.map(item => {
        return {
          value: item.id,
          label: item,
        }
      }));
  
    watch(() => form_data.value.wfp.fund_source?.office_id + form_data.value.wfp.fund_source?.year, async () => {
      overlay.value.component = shallowRef(Loading);
      overlay.value.show = true;
      await loadWfps(form_data.value.wfp.fund_source.year, form_data.value.wfp.fund_source.office_id);
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
            <form-select v-model:value="form_data.wfp.fund_source.office_id" :options="form_options.offices" />
            <form-field-error v-if="form_errors.wfp?.fund_source?.hasOwnProperty('office_id')" :text="form_errors.wfp.fund_source.office_id[0]" />
          </div>
  
          <div class="flex flex-col space-y-1">
            <form-label :text="'Year'" />
            <form-select v-model:value="form_data.wfp.fund_source.year" :options="form_options.years" />
            <form-field-error v-if="form_errors.wfp?.fund_source?.hasOwnProperty('year')" :text="form_errors.wfp.fund_source.year[0]" />
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
            <form-label :text="'Item'" />
            <form-suggestion v-model:value="form_data.item_id" :options="form_options.items">
              <template #format="{ value }">
                <div class="flex flex-col text-sm">
                  <span class="font-medium">{{ value.title }}</span>
                  <span class="italic">{{ value.category.name }}</span>
                  <span>{{ value.commodity_type }}</span>
                  <span>{{ value.details }}</span>
                </div>
              </template>
            </form-suggestion>
            <form-field-error v-if="form_errors.hasOwnProperty('item_id')" :text="form_errors.item_id[0]" />
          </div>
  
          <div class="flex flex-col space-y-1">
            <form-label :text="'Quantity'" />
            <form-number v-model:value="form_data.quantity" />
            <form-field-error v-if="form_errors.hasOwnProperty('quantity')" :text="form_errors.quantity[0]" />
          </div>
  
          <div class="flex flex-col space-y-1">
            <form-label :text="'Unit'" />
            <form-text v-model:value="form_data.unit" />
            <form-field-error v-if="form_errors.hasOwnProperty('unit')" :text="form_errors.unit[0]" />
          </div>
  
          <div class="flex flex-col space-y-1">
            <form-label :text="'ABC'" />
            <form-number v-model:value="form_data.abc" />
            <form-field-error v-if="form_errors.hasOwnProperty('abc')" :text="form_errors.abc[0]" />
          </div>
  
          <div class="flex flex-col space-y-1">
            <form-label :text="'Procurement Mode'" />
            <form-select v-model:value="form_data.procurement_mode" :options="form_options.procurement_modes" />
            <form-field-error v-if="form_errors.hasOwnProperty('procurement_mode')" :text="form_errors.procurement_mode[0]" />
          </div>
          
          <div class="grid grid-cols-3 gap-4">
            <div class="flex flex-col space-y-1">
              <form-label :text="'January'" />
              <form-number v-model:value="form_data.milestone_1" />
              <form-field-error v-if="form_errors.hasOwnProperty('milestone_1')" :text="form_errors.milestone_1[0]" />
            </div>
  
            <div class="flex flex-col space-y-1">
              <form-label :text="'February'" />
              <form-number v-model:value="form_data.milestone_2" />
              <form-field-error v-if="form_errors.hasOwnProperty('milestone_2')" :text="form_errors.milestone_2[0]" />
            </div>
  
            <div class="flex flex-col space-y-1">
              <form-label :text="'March'" />
              <form-number v-model:value="form_data.milestone_3" />
              <form-field-error v-if="form_errors.hasOwnProperty('milestone_3')" :text="form_errors.milestone_3[0]" />
            </div>
  
            <div class="flex flex-col space-y-1">
              <form-label :text="'April'" />
              <form-number v-model:value="form_data.milestone_4" />
              <form-field-error v-if="form_errors.hasOwnProperty('milestone_4')" :text="form_errors.milestone_4[0]" />
            </div>
  
            <div class="flex flex-col space-y-1">
              <form-label :text="'May'" />
              <form-number v-model:value="form_data.milestone_5" />
              <form-field-error v-if="form_errors.hasOwnProperty('milestone_5')" :text="form_errors.milestone_5[0]" />
            </div>
  
            <div class="flex flex-col space-y-1">
              <form-label :text="'June'" />
              <form-number v-model:value="form_data.milestone_6" />
              <form-field-error v-if="form_errors.hasOwnProperty('milestone_6')" :text="form_errors.milestone_6[0]" />
            </div>
  
            <div class="flex flex-col space-y-1">
              <form-label :text="'July'" />
              <form-number v-model:value="form_data.milestone_7" />
              <form-field-error v-if="form_errors.hasOwnProperty('milestone_7')" :text="form_errors.milestone_7[0]" />
            </div>
  
            <div class="flex flex-col space-y-1">
              <form-label :text="'August'" />
              <form-number v-model:value="form_data.milestone_8" />
              <form-field-error v-if="form_errors.hasOwnProperty('milestone_8')" :text="form_errors.milestone_8[0]" />
            </div>
  
            <div class="flex flex-col space-y-1">
              <form-label :text="'September'" />
              <form-number v-model:value="form_data.milestone_9" />
              <form-field-error v-if="form_errors.hasOwnProperty('milestone_9')" :text="form_errors.milestone_9[0]" />
            </div>
  
            <div class="flex flex-col space-y-1">
              <form-label :text="'October'" />
              <form-number v-model:value="form_data.milestone_10" />
              <form-field-error v-if="form_errors.hasOwnProperty('milestone_10')" :text="form_errors.milestone_10[0]" />
            </div>
  
            <div class="flex flex-col space-y-1">
              <form-label :text="'November'" />
              <form-number v-model:value="form_data.milestone_11" />
              <form-field-error v-if="form_errors.hasOwnProperty('milestone_11')" :text="form_errors.milestone_11[0]" />
            </div>
  
            <div class="flex flex-col space-y-1">
              <form-label :text="'December'" />
              <form-number v-model:value="form_data.milestone_12" />
              <form-field-error v-if="form_errors.hasOwnProperty('milestone_12')" :text="form_errors.milestone_12[0]" />
            </div>
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