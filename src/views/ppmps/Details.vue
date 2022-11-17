<script setup>
  import { shallowRef, ref, onMounted } from 'vue';
  import axios from 'axios';
  import Cookies from "js-cookie";

  import ButtonControl from './details/Button.vue';
  import TagNeutral from '../../components/tags/Neutral.vue';
  import TagPositive from '../../components/tags/Positive.vue';
  import TagNegative from '../../components/tags/Negative.vue';
  import DeleteDialog from './details/ConfirmDelete.vue';
  import Evaluation from './details/Evaluation.vue';
  import Loading from '../../components/overlays/Loading.vue';
  import Deleting from '../../components/overlays/Deleting.vue';
  import FormSelect from '../../components/form_controls/Select.vue';
  
  const props = defineProps(['id']);
  const emits = defineEmits(['edit', 'deleted', 'evaluated', 'cancel']);
  
  const data = ref({});
  const footer = ref('controls');
  
  const overlay = ref({
    show: false,
    component: '',
  });

  const permissions = JSON.parse(Cookies.get('auth_permissions') ?? []);

  const hasPermission = (name, office_id) => {
    const permission = permissions.find(x => x.n === name);
  
    return permission && permission.o.includes(office_id);
  };
  
  await onMounted(async () => {
    overlay.value.component = shallowRef(Loading);
    overlay.value.show = true;
    
    await axios.get(`${import.meta.env.VITE_API_URL}/ppmps/${props.id}`)
      .then(response => data.value = response.data);
  
    axios.get(`${import.meta.env.VITE_PORTAL_API_URL}/users/${data.value.last_modified_by_id}`)
      .then(response => data.value.last_modified_by = response.data)
  
    axios.get(`${import.meta.env.VITE_PORTAL_API_URL}/offices/${data.value.wfp.fund_source.office_id}`)
      .then(response => data.value.wfp.fund_source.office = response.data)
  
    data.value.evaluations?.forEach((evaluation, index) => {
      axios.get(`${import.meta.env.VITE_PORTAL_API_URL}/users/${evaluation.evaluated_by}`)
        .then(response => data.value.evaluations[index].evaluator = response.data);
    });
    
    overlay.value.show = false;
  });
  
  const showDelete = () => footer.value = 'confirm-delete';
  const cancelDelete = () => footer.value = 'controls';
  const confirmDelete = async () => {
    overlay.value.component = shallowRef(Deleting);
    overlay.value.show = true;
    
    await axios.delete(`${import.meta.env.VITE_API_URL}/ppmps/${data.value.id}`)
      .then(() => emits('deleted', data.value.id));
    
    overlay.value.show = false;
  }
  
  const showEvaluation = () => footer.value = 'evaluation';
  const cancelEvaluation = () => footer.value = 'controls';
  const evaluated = evaluated_ppmp => emits('evaluated', evaluated_ppmp);
</script>

<template>
  <div class="w-full h-full relative">
    <div class="flex flex-col space-y-6 max-h-full overflow-y-auto p-6">
      <div class="flex justify-between items-center border-b pb-1">
        <p class="text-gray-600 text-center font-medium">PPMP Details</p>
        <div class="flex justify-end space-x-6">
          <button v-if="data.status === 'for eval:l1' && hasPermission('ppmps:eval_l1', data.wfp.fund_source.office_id)" @click="showEvaluation()" class="text-xs text-gray-400 hover:text-gray-700 transition-colors duration-200" title="Evaluate">
            <i class="fas fa-scale-balanced" />
          </button>
          <button v-if="data.status === 'for eval:l2' && hasPermission('ppmps:eval_l1', data.wfp.fund_source.office_id)" @click="showEvaluation()" class="text-xs text-gray-400 hover:text-gray-700 transition-colors duration-200" title="Evaluate">
            <i class="fas fa-scale-balanced" />
          </button>
          <button v-if="['for eval:l1', 'rejected'].includes(data.status) && hasPermission('ppmps:manage', data.wfp.fund_source.office_id)" @click="$emit('edit', data.id)" class="text-xs text-gray-400 hover:text-gray-700 transition-colors duration-200" title="Edit">
            <i class="fas fa-pencil" />
          </button>
          <button v-if="data.status === 'approved' && hasPermission('ppmps:manage', data.wfp.fund_source.office_id)" @click="$emit('edit', data.id)" class="text-xs text-gray-400 hover:text-gray-700 transition-colors duration-200" title="Revise">
            <i class="fas fa-hammer" />
          </button>
          <button v-if="['for eval:l1', 'rejected'].includes(data.status) && hasPermission('ppmps:manage', data.wfp.fund_source.office_id)" @click="showDelete()" class="text-xs text-gray-400 hover:text-red-600 transition-colors duration-200" title="Delete">
            <i class="fas fa-trash" />
          </button>
          <button @click="$emit('cancel')" class="text-xs text-gray-400 hover:text-gray-700 transition-colors duration-200" title="Close">
            <i class="fas fa-xmark" />
          </button>
        </div>
      </div>
      
      <delete-dialog
        v-if="footer === 'confirm-delete'"
        @cancel="cancelDelete"
        @confirm="confirmDelete"
      />
  
      <evaluation
        v-if="footer === 'evaluation'"
        :id="data.id"
        @cancel="cancelEvaluation"
        @evaluated="evaluated"
      />
  
      <div class="flex items-center space-x-2">
        <tag-neutral :label="data.code" />
        <tag-positive v-if="data.status === 'approved'" :label="data.status" />
        <tag-negative v-else-if="data.status === 'rejected'" :label="data.status" />
        <tag-neutral v-else :label="data.status" />
      </div>
  
      <div class="flex flex-col space-y-6">
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-sm font-medium">Item</span>
          <span class="text-sm text-gray-600 flex flex-col">
            <span>{{ data.item?.title }}</span>
            <span class="italic">{{ data.item?.category.name }}</span>
            <span>{{ data.item?.commodity_type }}</span>
            <span>{{ data.item?.details }}</span>
          </span>
        </div>
        
        <div class="grid grid-cols-2 gap-6">
          <div class="flex flex-col space-y-1">
            <span class="text-gray-600 text-sm font-medium">Quantity</span>
            <span class="text-sm text-gray-600">{{ data.quantity?.toLocaleString() }}</span>
          </div>
  
          <div class="flex flex-col space-y-1">
            <span class="text-gray-600 text-sm font-medium">ABC</span>
            <span class="text-sm text-gray-600">{{ new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(data.abc) }}</span>
          </div>
        </div>
  
        <div class="grid grid-cols-3 gap-x-6 gap-y-2">
          <span class="flex items-center border border-gray-600 rounded">
            <span class="w-10 text-center text-xs text-white uppercase bg-gray-600 py-1">Jan</span>
            <span class="text-sm px-1 py-0.5">{{ data.milestone_1?.toLocaleString() }}</span>
          </span>
          <span class="flex items-center border border-gray-600 rounded">
            <span class="w-10 text-center text-xs text-white uppercase bg-gray-600 py-1">Feb</span>
            <span class="text-sm px-1 py-0.5">{{ data.milestone_2?.toLocaleString() }}</span>
          </span>
          <span class="flex items-center border border-gray-600 rounded">
            <span class="w-10 text-center text-xs text-white uppercase bg-gray-600 py-1">Mar</span>
            <span class="text-sm px-1 py-0.5">{{ data.milestone_3?.toLocaleString() }}</span>
          </span>
          <span class="flex items-center border border-gray-600 rounded">
            <span class="w-10 text-center text-xs text-white uppercase bg-gray-600 py-1">Apr</span>
            <span class="text-sm px-1 py-0.5">{{ data.milestone_4?.toLocaleString() }}</span>
          </span>
          <span class="flex items-center border border-gray-600 rounded">
            <span class="w-10 text-center text-xs text-white uppercase bg-gray-600 py-1">May</span>
            <span class="text-sm px-1 py-0.5">{{ data.milestone_5?.toLocaleString() }}</span>
          </span>
          <span class="flex items-center border border-gray-600 rounded">
            <span class="w-10 text-center text-xs text-white uppercase bg-gray-600 py-1">June</span>
            <span class="text-sm px-1 py-0.5">{{ data.milestone_6?.toLocaleString() }}</span>
          </span>
          <span class="flex items-center border border-gray-600 rounded">
            <span class="w-10 text-center text-xs text-white uppercase bg-gray-600 py-1">July</span>
            <span class="text-sm px-1 py-0.5">{{ data.milestone_7?.toLocaleString() }}</span>
          </span>
          <span class="flex items-center border border-gray-600 rounded">
            <span class="w-10 text-center text-xs text-white uppercase bg-gray-600 py-1">Aug</span>
            <span class="text-sm px-1 py-0.5">{{ data.milestone_8?.toLocaleString() }}</span>
          </span>
          <span class="flex items-center border border-gray-600 rounded">
            <span class="w-10 text-center text-xs text-white uppercase bg-gray-600 py-1">Sept</span>
            <span class="text-sm px-1 py-0.5">{{ data.milestone_9?.toLocaleString() }}</span>
          </span>
          <span class="flex items-center border border-gray-600 rounded">
            <span class="w-10 text-center text-xs text-white uppercase bg-gray-600 py-1">Oct</span>
            <span class="text-sm px-1 py-0.5">{{ data.milestone_10?.toLocaleString() }}</span>
          </span>
          <span class="flex items-center border border-gray-600 rounded">
            <span class="w-10 text-center text-xs text-white uppercase bg-gray-600 py-1">Nov</span>
            <span class="text-sm px-1 py-0.5">{{ data.milestone_11?.toLocaleString() }}</span>
          </span>
          <span class="flex items-center border border-gray-600 rounded">
            <span class="w-10 text-center text-xs text-white uppercase bg-gray-600 py-1">Dec</span>
            <span class="text-sm px-1 py-0.5">{{ data.milestone_12?.toLocaleString() }}</span>
          </span>
        </div>
  
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-sm font-medium">WFP</span>
          <span class="text-sm text-gray-600 flex flex-col">
            <span>{{ data.wfp?.code }}</span>
            <span>{{ data.wfp?.item }}</span>
            <span v-if="data.wfp">
              {{ new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                  .format(new Date(data.wfp.timeframe_from))
                  + ' - '
                  + new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                    .format(new Date(data.wfp.timeframe_to)) }}
            </span>
            <span>{{ new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(data.wfp?.cost - data.wfp?.allocated) }}</span>
            <span>{{ data.wfp?.fund_source.name }}</span>
          </span>
        </div>
    
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-sm font-medium">Office</span>
          <span class="text-sm text-gray-600">{{ data.wfp?.fund_source.office?.name }}</span>
        </div>
    
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-sm font-medium">Status</span>
          <span class="text-xs text-gray-600 uppercase">{{ data.status }}</span>
        </div>
  
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-sm font-medium">Last Modified By</span>
          <span class="text-sm text-gray-600">{{ data.last_modified_by?.name }}</span>
          <span class="text-xs text-gray-400">
            {{ new Date(data.updated_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric'}) }}
          </span>
        </div>
    
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-sm font-medium">Evaluations</span>
          <span class="flex flex-col space-y-4">
            <span v-if="data.evaluations?.length > 0" v-for="row in data.evaluations" class="flex flex-col text-xs text-gray-600">
              <span v-if="row.evaluation === 'approved'" class="text-green-600 uppercase">{{ row.evaluation }}</span>
              <span v-else-if="row.evaluation === 'rejected'" class="text-red-600 uppercase">{{ row.evaluation }}</span>
              <span class="font-medium">{{ row.evaluator?.name }}</span>
              <span class="italic">{{ row.remarks }}</span>
              <span class="text-gray-400">{{ new Date(row.created_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric'}) }}</span>
            </span>
            <span v-else class="text-gray-600 text-sm font-medium">---</span>
          </span>
        </div>
      </div>
    </div>
    
    <component v-if="overlay.show" :is="overlay.component" />
  </div>
</template>