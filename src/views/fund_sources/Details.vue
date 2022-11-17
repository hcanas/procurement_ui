<script setup>
  import { ref } from 'vue';
  import { useGate } from '../../composables/gate';
  import { useFormatter } from '../../composables/formatter';
  import { useDB } from '../../composables/db';

  import BtnIcon from '../../components/buttons/Icon.vue';

  const props = defineProps(['data']);
  const emits = defineEmits(['close', 'evaluate', 'edit', 'delete']);

  const { hasPermission } = useGate();
  const { formatDateTime, formatCurrency } = useFormatter();
  const { getRecord } = useDB();

  const fund_source = ref({});

  await getRecord(`${import.meta.env.VITE_API_URL}/fund_sources/${props.data.id}`, response => fund_source.value = response.data);
  getRecord(`${import.meta.env.VITE_PORTAL_API_URL}/offices/${fund_source.value.office_id}`, response => fund_source.value.office = response.data);
  getRecord(`${import.meta.env.VITE_PORTAL_API_URL}/users/${fund_source.value.last_modified_by_id}`, response => fund_source.value.last_modified_by = response.data);

  const controls = {
    edit: hasPermission(['fund_sources:manage', 'fund_sources:update'], fund_source.value.office_id),
    delete: hasPermission(['fund_sources:manage', 'fund_sources:delete'], fund_source.value.office_id),
  };
</script>

<template>
  <div class="w-full h-full relative">
    <div class="flex justify-end px-3 py-2">
      <BtnIcon v-if="controls.edit" @click="$emit('edit', data.id)" :icon="'fas fa-pencil'" :label="'Edit'" class="text-gray-500 hover:text-blue-600" title="Edit" />
      <BtnIcon v-if="controls.delete" @click="$emit('delete')" :icon="'fas fa-trash'" :label="'Delete'" class="text-gray-500 hover:text-red-600" title="Delete" />
    </div>

    <div class="flex flex-col space-y-6 max-h-full px-6 py-2 overflow-y-auto">
      <!-- <delete-dialog
        v-if="footer === 'confirm-delete'"
        @cancel="cancelDelete"
        @confirm="confirmDelete"
      />
  
      <evaluation
        v-if="footer === 'evaluation'"
        :id="data.id"
        @cancel="cancelEvaluation"
        @evaluated="evaluated"
      /> -->
  
      <div class="flex flex-col space-y-6">
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-xs uppercase font-bold">Year</span>
          <span class="text-sm text-gray-600">{{ fund_source.year }}</span>
        </div>
        
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-xs uppercase font-bold">Name</span>
          <span class="text-sm text-gray-600">{{ fund_source.name }}</span>
        </div>
        
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-xs uppercase font-bold">Amount</span>
          <span class="text-sm text-gray-600">{{ formatCurrency(fund_source.amount) }}</span>
        </div>
        
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-xs uppercase font-bold">Allocated</span>
          <span class="text-sm text-gray-600">{{ formatCurrency(fund_source.allocated) }}</span>
        </div>
        
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-xs uppercase font-bold">Remaining</span>
          <span class="text-sm text-gray-600">{{ formatCurrency(fund_source.amount - fund_source.allocated) }}</span>
        </div>
        
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-xs uppercase font-bold">Office</span>
          <span class="text-sm text-gray-600">{{ fund_source.office?.name }}</span>
        </div>
        
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-xs uppercase font-bold">Last Modified By</span>
          <span class="text-sm text-gray-600 flex flex-col">
            <span>{{ fund_source.last_modified_by?.name }}</span>
            <span>{{ formatDateTime(fund_source.updated_at) }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>