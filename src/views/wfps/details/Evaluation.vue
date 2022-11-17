<script setup>
  import { ref } from 'vue';
  import axios from 'axios';
  
  import FormLabel from '../../../components/form_controls/Label.vue';
  import FormSelect from '../../../components/form_controls/Select.vue';
  import FormTextArea from '../../../components/form_controls/TextArea.vue';
  import FormFieldError from '../../../components/form_controls/FieldError.vue';
  import BtnNeutral from '../../../components/buttons/Neutral.vue';
  import BtnPrimary from '../../../components/buttons/Primary.vue';
  import Saving from '../../../components/overlays/Saving.vue';
  
  const props = defineProps(['id']);
  const emits = defineEmits(['cancel', 'evaluated']);
  
  const saving = ref(false);

  const form_options = ref({
    evaluations: [
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' }
    ],
  });
  
  const form_data = ref({
    evaluation: form_options.value.evaluations[0].value,
    remarks: '',
  });
  
  const form_errors = ref({});
  
  const save = async () => {
    saving.value = true;
    
    await axios.post(`${import.meta.env.VITE_API_URL}/evaluated_wfps`, {
      ...form_data.value,
      wfp_id: props.id,
    }).then(response => emits('evaluated', response.data));
    
    saving.value = false;
  };
</script>

<template>
  <div class="bg-white p-4 rounded-lg">
    <form @submit.prevent>
      <div class="flex flex-col space-y-6">
        <div class="flex flex-col space-y-1">
          <form-label :text="'Evaluation'" />
          <form-select v-model:value="form_data.evaluation" :options="form_options.evaluations" />
          <form-field-error v-if="form_errors.hasOwnProperty('evaluation')" :text="form_errors.evaluation[0]" />
        </div>
        
        <div class="flex flex-col space-y-1">
          <form-label :text="'Remarks'" />
          <form-text-area v-model:value="form_data.remarks" class="h-24" />
          <form-field-error v-if="form_errors.hasOwnProperty('evaluation')" :text="form_errors.evaluation[0]" />
        </div>
        
        <div class="flex justify-end space-x-6">
          <btn-neutral @click="emits('cancel')" :text="'Cancel'" :icon="'fas fa-xmark'" />
          <btn-primary @click="save" :text="'Save'" :icon="'fas fa-save'" />
        </div>
      </div>
    </form>
  </div>
  
  <saving v-if="saving" />
</template>