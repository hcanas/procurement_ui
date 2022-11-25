<script setup>
  document.title = 'APPs';
  
  import { shallowRef, ref, watch } from 'vue';
  import axios from 'axios';
  import Cookies from 'js-cookie';
  
  import "ag-grid-community/styles/ag-grid.css";
  import "ag-grid-community/styles/ag-theme-material.min.css";
  import { AgGridVue } from "ag-grid-vue3";
  import AgGridLoadingComponent from '../../components/loaders/Loading.vue';
  import ItemCol from './base/ItemCol.vue';
  import WfpCol from './base/WfpCol.vue';
  import StatusCol from './base/StatusCol.vue';
  import ActionsCol from './base/ActionsCol.vue';
  import CustomForm from './Form.vue';
  import DeleteDialog from './Delete.vue';
  import Details from './Details.vue';
  
  import PageHeader from '../../components/PageHeader.vue';
  import FormSearch from '../../components/form_controls/Search.vue';
  import FormSelect from '../../components/form_controls/Select.vue';
  import BtnPrimary from '../../components/buttons/Primary.vue';

  const offices = ref(JSON.parse(Cookies.get('auth_permissions') ?? [])
    .find(permission => permission.n === 'apps:manage')?.o ?? []);
  
  const ag_grid = ref({
    api: null,
    row_data: [],
    col_defs: [
      {
        field: 'code',
        sortable: true,
        width: 180,
      },
      {
        headerName: 'Item',
        field: 'item',
        sortable: true,
        flex: 2,
        wrapText: true,
        autoHeight: true,
        cellRenderer: ItemCol,
      },
      {
        headerName: 'Procurement Mode',
        field: 'procurement_mode',
        sortable: true,
        width: 180,
        wrapText: true,
        autoHeight: true,
      },
      {
        headerName: 'Estimated Budget',
        sortable: true,
        flex: 1,
        wrapText: true,
        autoHeight: true,
        valueGetter: params => {
          return params.data.quantity
            + params.data.unit
            + ' x '
            + (new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(params.data.abc))
            + ' = '
            + (new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(params.data.abc * params.data.quantity))
        },
        comparator: (num1, num2) => num1 - num2,
      },
      {
        headerName: 'WFP',
        field: 'wfp',
        sortable: true,
        flex: 2,
        wrapText: true,
        autoHeight: true,
        cellRenderer: WfpCol,
      },
      {
        headerName: 'Office',
        field: 'wfp.fund_source.office.name',
        sortable: true,
        flex: 2,
        wrapText: true,
        autoHeight: true,
      },
      {
        field: 'status',
        sortable: true,
        width: 140,
        cellRenderer: StatusCol,
      },
      {
        headerName: '',
        width: 70,
        cellRenderer: ActionsCol,
        cellRendererParams: {
          clicked: id => showDetails(id),
        },
      },
    ],
    filter_text: '',
    year: new Date().getFullYear(),
    years: [
      { label: 2022, value: 2022 },
      { label: 2023, value: 2023 },
      { label: 2024, value: 2024 },
      { label: 2025, value: 2025 },
    ],
  });
  
  const drawer = ref({
    show: false,
    component: '',
    id: null,
  });

  const loadData = year => {
    ag_grid.value.api.showLoadingOverlay();
    
    axios.get(`${import.meta.env.VITE_API_URL}/apps?year=${year}`)
      .then(response => {
        ag_grid.value.row_data = response.data.map(data => {
          data.wfp.fund_source.office = offices.value.find(office => office.id === data.wfp.fund_source.office_id);
          return data;
        });
      })
      .catch(() => {});
  };
  
  const onGridReady = params => {
    ag_grid.value.api = params.api;
    loadData(ag_grid.value.year);
  };
  
  const showDetails = id => {
    drawer.value.component = shallowRef(Details);
    drawer.value.id = id;
    drawer.value.show = true;
  };
  
  const showForm = id => {
    drawer.value.id = id;
    drawer.value.component = shallowRef(CustomForm);
    drawer.value.show = true;
  };
  
  const closeDrawer = id => {
    if (id) showDetails(id);
    else {
      drawer.value.show = false;
      drawer.value.id = null;
    }
  };
  
  const createdPpmp = new_data => {
    new_data.wfp.fund_source.office = offices.value.find(office => office.id === new_data.wfp.fund_source.office_id);
    ag_grid.value.api.applyTransaction({ add: [new_data], addIndex: 0 });
    closeDrawer();
  };
  
  const updatedPpmp = new_data => {
    new_data.wfp.fund_source.office = offices.value.find(office => office.id === new_data.wfp.fund_source.office_id);
    ag_grid.value.api.applyTransaction({ update: [new_data] });
    showDetails(new_data.id);
  };
  
  const deletedPpmp = id => {
    ag_grid.value.api.applyTransaction({ remove: [ag_grid.value.api.getRowNode(id)]});
    closeDrawer();
  };
  
  const evaluatedWfp = evaluated_wfp => {
    const wfp = ag_grid.value.api.getRowNode(evaluated_wfp.id).data;
    wfp.status = evaluated_wfp.status;
    ag_grid.value.api.applyTransaction({ update: [wfp] });
    closeDrawer();
  };
  
  await axios.get(`${import.meta.env.VITE_PORTAL_API_URL}/offices`)
    .then(response => {
      offices.value = offices.value.map(office_id => response.data.find(data => data.id === office_id));
    });
  
  watch(() => ag_grid.value.filter_text, text => ag_grid.value.api.setQuickFilter(text));
  watch(() => ag_grid.value.year, year => loadData(year));
</script>

<template>
  <div class="w-full h-full flex">
    <div class="flex-grow h-full flex flex-col px-12">
      <page-header :title="'APPs'">
        <template #controls>
          <div class="flex items-center space-x-2">
            <form-search v-model:value="ag_grid.filter_text" />
            <form-select v-model:value="ag_grid.year" :options="ag_grid.years" />
            <btn-primary @click="showForm()" :text="'New APP'" :icon="'fas fa-plus'" />
          </div>
        </template>
      </page-header>
    
      <ag-grid-vue
        class="w-full flex-grow ag-theme-material"
        @grid-ready="onGridReady"
        :rowData="ag_grid.row_data"
        :getRowId="params => params.data.id"
        :columnDefs="ag_grid.col_defs"
        :pagination="true"
        :paginationPageSize="20"
        :loadingOverlayComponent="AgGridLoadingComponent"
        :suppressCellFocus="true"
        :enableCellTextSelection=true
      />
    </div>
    
    <div class="flex-shrink-0 transition-[width] duration-300" :class="{ 'w-[32rem] bg-gray-50 border-l': drawer.show, 'w-0': !drawer.show }">
      <component
        v-if="drawer.show"
        :is="drawer.component"
        :id="drawer.id"
        :key="drawer.id"
        @created="createdPpmp"
        @updated="updatedPpmp"
        @deleted="deletedPpmp"
        @evaluated="evaluatedWfp"
        @edit="showForm"
        @cancel="closeDrawer"
      />
    </div>
  </div>
</template>

<style>
  .ag-cell-value {
    @apply leading-normal py-1
  }
</style>