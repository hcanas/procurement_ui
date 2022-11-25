<script setup>
  import { ref } from 'vue';
  import { useGate } from '../../composables/gate';
  import { useFormatter } from '../../composables/formatter';
  import { useDB } from '../../composables/db';

  import BtnNeutral from '../../components/buttons/Neutral.vue';
  import BtnDanger from '../../components/buttons/Danger.vue';
  import DeleteDialog from '../../components/dialogs/Delete.vue';
  import Deleting from '../../components/loaders/Deleting.vue';

  const props = defineProps(['data']);
  const emits = defineEmits(['edit', 'deleted', 'alert']);

  const { hasPermission } = useGate();
  const { formatDateTime, formatCurrency } = useFormatter();
  const { getRecord, deleteRecord } = useDB();

  getRecord(`${import.meta.env.VITE_PORTAL_API_URL}/offices/${props.data.office_id}`, response => props.data.office = response.data);
  getRecord(`${import.meta.env.VITE_PORTAL_API_URL}/users/${props.data.last_modified_by_id}`, response => props.data.last_modified_by = response.data);

  const controls = {
    edit: hasPermission(['fund_sources:manage', 'fund_sources:update'], props.data.office_id),
    delete: hasPermission(['fund_sources:manage', 'fund_sources:delete'], props.data.office_id),
  };

  const deleting = ref(false);

  const showDeleteForm = ref(false);

  const deleteFundSource = async () => {
    deleting.value = true;

    await deleteRecord(`${import.meta.env.VITE_API_URL}/fund_sources/${props.data.id}`, response => {
      emits('deleted', props.data.id);
      emits('alert', {
        type: 'success',
        message: 'Fund source has been deleted.',
      });
    }, error => {
      emits('alert', {
        type: 'error',
        message: error.response.data,
      });
    });

    deleting.value = false;
  };
</script>

<template>
  <div class="w-full h-full relative">
    <div class="flex flex-col space-y-6 max-h-full px-6 py-4 overflow-y-auto">
      <DeleteDialog
        v-if="showDeleteForm"
        @cancel="showDeleteForm = false"
        @confirm="deleteFundSource"
      />
  
      <div class="flex flex-col space-y-6">
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-xs uppercase font-bold">Year</span>
          <span class="text-sm text-gray-600">{{ data.year }}</span>
        </div>
        
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-xs uppercase font-bold">Name</span>
          <span class="text-sm text-gray-600">{{ data.name }}</span>
        </div>
        
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-xs uppercase font-bold">Amount</span>
          <span class="text-sm text-gray-600">{{ formatCurrency(data.amount) }}</span>
        </div>
        
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-xs uppercase font-bold">Allocated</span>
          <span class="text-sm text-gray-600">{{ formatCurrency(data.allocated) }}</span>
        </div>
        
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-xs uppercase font-bold">Remaining</span>
          <span class="text-sm text-gray-600">{{ formatCurrency(data.amount - data.allocated) }}</span>
        </div>
        
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-xs uppercase font-bold">Office</span>
          <span class="text-sm text-gray-600">{{ data.office?.name }}</span>
        </div>
        
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-xs uppercase font-bold">Last Modified By</span>
          <span class="text-sm text-gray-600 flex flex-col">
            <span>{{ data.last_modified_by?.name }}</span>
            <span>{{ formatDateTime(data.updated_at) }}</span>
          </span>
        </div>
      </div>
    </div>

    <div class="flex justify-end space-x-3 px-3 py-2">
      <BtnNeutral v-if="controls.edit" @click="$emit('edit', data.id)" :icon="'fas fa-pencil'" :text="'Edit'" />
      <BtnDanger v-if="controls.delete" @click="showDeleteForm = true" :icon="'fas fa-trash'" :text="'Delete'" />
    </div>

    <Deleting v-if="deleting" />
  </div>
</template>