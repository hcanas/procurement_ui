<script setup>
  import { shallowRef, ref, onMounted } from 'vue';
  import axios from 'axios';
  import Cookies from "js-cookie";
  import ExcelJS from 'exceljs';
  import { saveAs } from 'file-saver';
  
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
    
    await axios.get(`${import.meta.env.VITE_API_URL}/wfps/${props.id}`)
      .then(response => data.value = response.data);
  
    axios.get(`${import.meta.env.VITE_PORTAL_API_URL}/users/${data.value.responsible_person_id}`)
      .then(response => data.value.responsible_person = response.data)
  
    axios.get(`${import.meta.env.VITE_PORTAL_API_URL}/users/${data.value.last_modified_by_id}`)
      .then(response => data.value.last_modified_by = response.data)
  
    axios.get(`${import.meta.env.VITE_PORTAL_API_URL}/offices/${data.value.fund_source.office_id}`)
      .then(response => data.value.fund_source.office = response.data)
  
    data.value.evaluations.forEach((evaluation, index) => {
      axios.get(`${import.meta.env.VITE_PORTAL_API_URL}/users/${evaluation.evaluated_by_id}`)
        .then(response => data.value.evaluations[index].evaluated_by = response.data);
    });
    
    overlay.value.show = false;
  });
  
  const showDelete = () => footer.value = 'confirm-delete';
  const cancelDelete = () => footer.value = 'controls';
  const confirmDelete = async () => {
    overlay.value.component = shallowRef(Deleting);
    overlay.value.show = true;
    
    await axios.delete(`${import.meta.env.VITE_API_URL}/wfps/${data.value.id}`)
      .then(() => emits('deleted', data.value.id));
    
    overlay.value.show = false;
  }
  
  const showEvaluation = () => footer.value = 'evaluation';
  const cancelEvaluation = () => footer.value = 'controls';
  const evaluated = evaluated_wfp => emits('evaluated', evaluated_wfp);
  
  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.created = new Date();
    workbook.modified = new Date();
    
    const sheet = workbook.addWorksheet(data.value.code);
    const border_style = { 
      top: { style: 'thin' }, 
      left: { style: 'thin' }, 
      right: { style: 'thin' }, 
      bottom: { style: 'thin' },
    };
    
    sheet.mergeCells('A1:M1');
    sheet.getCell('A1').style.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell('A1').style.font = { size: 12, bold: true };
    sheet.getCell('A1').value = 'Work Financial Plan';
    
    sheet.mergeCells('A2:M2');
    sheet.getCell('A2').style.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell('A2').value = new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
    
    sheet.mergeCells('A3:M3');
    sheet.getCell('A3').style.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell('A3').value = data.value.code;
    
    sheet.mergeCells('A5:A6');
    sheet.getCell('A5').style.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell('A5').style.font = { bold: true };
    sheet.getCell('A5').border = border_style;
    sheet.getCell('A5').value = 'Function Type';
    
    sheet.mergeCells('B5:B6');
    sheet.getCell('B5').style.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell('B5').style.font = { bold: true };
    sheet.getCell('B5').border = border_style;
    sheet.getCell('B5').value = 'Deliverables';
    
    sheet.mergeCells('C5:C6');
    sheet.getCell('C5').style.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell('C5').style.font = { bold: true };
    sheet.getCell('C5').border = border_style;
    sheet.getCell('C5').value = 'Activities';
    
    sheet.mergeCells('D5:D6');
    sheet.getCell('D5').style.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell('D5').style.font = { bold: true };
    sheet.getCell('D5').border = border_style;
    sheet.getCell('D5').value = 'Timeframe';
    
    sheet.mergeCells('E5:H5');
    sheet.getCell('E5').style.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell('E5').style.font = { bold: true };
    sheet.getCell('E5').border = border_style;
    sheet.getCell('E5').value = 'Targets';
    
    sheet.getCell('E6').style.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell('E6').style.font = { bold: true };
    sheet.getCell('E6').border = border_style;
    sheet.getCell('E6').value = 'Q1';
    
    sheet.getCell('F6').style.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell('F6').style.font = { bold: true };
    sheet.getCell('F6').border = border_style;
    sheet.getCell('F6').value = 'Q2';
    
    sheet.getCell('G6').style.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell('G6').style.font = { bold: true };
    sheet.getCell('G6').border = border_style;
    sheet.getCell('G6').value = 'Q3';
    
    sheet.getCell('H6').style.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell('H6').style.font = { bold: true };
    sheet.getCell('H6').border = border_style;
    sheet.getCell('H6').value = 'Q4';
    
    sheet.mergeCells('I5:K5');
    sheet.getCell('I5').style.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell('I5').style.font = { bold: true };
    sheet.getCell('I5').border = border_style;
    sheet.getCell('I5').value = 'Resource Requirements';
    
    sheet.getCell('I6').style.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell('I6').style.font = { bold: true };
    sheet.getCell('I6').border = border_style;
    sheet.getCell('I6').value = 'Item';
    
    sheet.getCell('J6').style.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell('J6').style.font = { bold: true };
    sheet.getCell('J6').border = border_style;
    sheet.getCell('J6').value = 'Cost';
    
    sheet.getCell('K6').style.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell('K6').style.font = { bold: true };
    sheet.getCell('K6').border = border_style;
    sheet.getCell('K6').value = 'Fund Source';
  
    sheet.mergeCells('L5:L6');
    sheet.getCell('L5').style.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell('L5').style.font = { bold: true };
    sheet.getCell('L5').border = border_style;
    sheet.getCell('L5').value = 'Responsible Person';
  
    sheet.mergeCells('M5:M6');
    sheet.getCell('M5').style.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getCell('M5').style.font = { bold: true };
    sheet.getCell('M5').border = border_style;
    sheet.getCell('M5').value = 'Remarks';
    
    // column sizing
    sheet.getColumn('A').width = 15;
    sheet.getColumn('B').width = 50;
    sheet.getColumn('C').width = 50;
    sheet.getColumn('D').width = 20;
    sheet.getColumn('E').width = 7;
    sheet.getColumn('F').width = 7;
    sheet.getColumn('G').width = 7;
    sheet.getColumn('H').width = 7;
    sheet.getColumn('I').width = 25;
    sheet.getColumn('J').width = 15;
    sheet.getColumn('K').width = 20;
    sheet.getColumn('L').width = 25;
    sheet.getColumn('M').width = 50;
    
    // values
    sheet.getCell('A7').value = data.value.function_type;
    sheet.getCell('A7').alignment = { horizontal: 'center', vertical: 'top' };
    sheet.getCell('A7').border = border_style;
    
    sheet.getCell('B7').value = data.value.deliverables;
    sheet.getCell('B7').alignment = { vertical: 'top', wrapText: true };
    sheet.getCell('B7').border = border_style;
    
    sheet.getCell('C7').value = data.value.activities;
    sheet.getCell('C7').alignment = { vertical: 'top', wrapText: true };
    sheet.getCell('C7').border = border_style;
    
    sheet.getCell('D7').value = new Date(data.value.timeframe_from).toLocaleDateString('en-PH', {
      month: 'short', day: 'numeric', year: 'numeric' })
      + ' - '
      + new Date(data.value.timeframe_to).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
    sheet.getCell('D7').alignment = { horizontal: 'center', vertical: 'top', wrapText: true };
    sheet.getCell('D7').border = border_style;
    
    sheet.getCell('E7').value = data.value.target_q1;
    sheet.getCell('E7').alignment = { horizontal: 'center', vertical: 'top' };
    sheet.getCell('E7').border = border_style;
    
    sheet.getCell('F7').value = data.value.target_q2;
    sheet.getCell('F7').alignment = { horizontal: 'center', vertical: 'top' };
    sheet.getCell('F7').border = border_style;
    
    sheet.getCell('G7').value = data.value.target_q3;
    sheet.getCell('G7').alignment = { horizontal: 'center', vertical: 'top' };
    sheet.getCell('G7').border = border_style;
    
    sheet.getCell('H7').value = data.value.target_q4;
    sheet.getCell('H7').alignment = { horizontal: 'center', vertical: 'top' };
    sheet.getCell('H7').border = border_style;
    
    sheet.getCell('I7').value = data.value.item;
    sheet.getCell('I7').alignment = { vertical: 'top', wrapText: true };
    sheet.getCell('I7').border = border_style;
    
    sheet.getCell('J7').value = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(data.value.cost);
    sheet.getCell('J7').alignment = { horizontal: 'right', vertical: 'top' };
    sheet.getCell('J7').border = border_style;
    
    sheet.getCell('K7').value = data.value.fund_source.name;
    sheet.getCell('K7').alignment = { vertical: 'top' };
    sheet.getCell('K7').border = border_style;
    
    sheet.getCell('L7').value = data.value.responsible_person?.name;
    sheet.getCell('L7').alignment = { vertical: 'top', wrapText: true };
    sheet.getCell('L7').border = border_style;
    
    sheet.getCell('M7').value = JSON.parse(JSON.stringify(data.value.evaluations)).pop().remarks ?? '';
    sheet.getCell('M7').alignment = { vertical: 'top', wrapText: true };
    sheet.getCell('M7').border = border_style;
    
    await workbook.xlsx.writeBuffer()
      .then(response => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });
  
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = data.value.code + '.xlsx';
        a.click();
      });
  };
</script>

<template>
  <div class="w-full h-full relative">
    <div class="flex flex-col space-y-6 max-h-full overflow-y-auto p-6">
      <div class="flex justify-between items-center border-b pb-1">
        <p class="text-gray-600 text-center font-medium">WFP Details</p>
        <div class="flex justify-end space-x-6">
          <button-control
            v-if="data.status === 'approved' && hasPermission('wfps:manage', data.fund_source.office_id)"
            @click="exportExcel()"
            :icon="'fas fa-file-excel'"
            :label="'Export'"
          />
          <button-control
            v-if="['for eval:l1', 'for eval:l2'].includes(data.status) && (hasPermission('wfps:eval_l1', data.fund_source.office_id) || hasPermission('wfps:eval_l2', data.fund_source.office_id))"
            @click="showEvaluation()"
            :icon="'fas fa-scale-balanced'"
            :label="'Evaluate'"
          />
          <button-control
            v-if="['for eval:l1', 'rejected'].includes(data.status) && hasPermission('wfps:manage', data.fund_source.office_id)"
            @click="$emit('edit', data.id)"
            :icon="'fas fa-pencil'"
            :label="'Edit'"
          />
          <button-control
            v-if="data.status === 'approved' && hasPermission('wfps:manage', data.fund_source.office_id)"
            @click="$emit('edit', data.id)"
            :icon="'fas fa-hammer'"
            :label="'Revise'"
          />
          <button-control
            v-if="['for eval:l1', 'rejected'].includes(data.status) && hasPermission('wfps:manage', data.fund_source.office_id)"
            @click="showDelete()"
            :icon="'fas fa-trash'"
            :label="'Delete'"
          />
          <button-control
            @click="$emit('cancel')"
            :icon="'fas fa-xmark'"
            :label="'Close'"
          />
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
        <tag-neutral :label="data.function_type" />
        <tag-positive v-if="data.status === 'approved'" :label="data.status" />
        <tag-negative v-else-if="data.status === 'rejected'" :label="data.status" />
        <tag-neutral v-else :label="data.status" />
      </div>
  
      <div class="flex flex-col space-y-6">
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-sm font-medium">Deliverables</span>
          <span class="text-sm text-gray-600">{{ data.deliverables }}</span>
        </div>
    
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-sm font-medium">Activities</span>
          <span class="text-sm text-gray-600">{{ data.activities }}</span>
        </div>
    
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-sm font-medium">Timeframe</span>
          <span class="text-sm text-gray-600 flex items-center space-x-2">
            <span>{{ new Date(data.timeframe_from).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
            <span>-</span>
            <span>{{ new Date(data.timeframe_to).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
          </span>
        </div>
    
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-sm font-medium">Targets</span>
          <span class="text-sm text-gray-600 flex items-center space-x-2">
            <span>{{ `${data.target_q1}(Q1)` }}</span>
            <span>-</span>
            <span>{{ `${data.target_q2}(Q2)` }}</span>
            <span>-</span>
            <span>{{ `${data.target_q3}(Q3)` }}</span>
            <span>-</span>
            <span>{{ `${data.target_q4}(Q4)` }}</span>
          </span>
        </div>
    
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-sm font-medium">Item</span>
          <span class="text-sm text-gray-600">{{ data.item }}</span>
        </div>
    
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-sm font-medium">Cost</span>
          <span class="text-sm text-gray-600">{{ new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(data.cost) }}</span>
        </div>
    
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-sm font-medium">Fund Source</span>
          <span class="text-sm text-gray-600">{{ data.fund_source?.name }}</span>
        </div>
    
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-sm font-medium">Office</span>
          <span class="text-sm text-gray-600">{{ data.fund_source?.office?.name }}</span>
        </div>
    
        <div class="flex flex-col space-y-1">
          <span class="text-gray-600 text-sm font-medium">Responsible Person</span>
          <span class="text-sm text-gray-600">{{ data.responsible_person?.name }}</span>
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
              <span class="font-medium">{{ row.evaluated_by?.name }}</span>
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