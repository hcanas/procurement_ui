<script setup>
  import { ref, watch } from 'vue';
  import { useGate } from '../../composables/gate';
  import { useFormatter } from '../../composables/formatter';
  import { useDB } from '../../composables/db';
  
  import "ag-grid-community/styles/ag-grid.css";
  import "ag-grid-community/styles/ag-theme-material.min.css";
  import { AgGridVue } from "ag-grid-vue3";
  import AgGridLoadingComponent from '../../components/overlays/Loading.vue';
  import AgGridActionsCol from './AgGridActionsCol.vue';
  
  import PageHeader from '../../components/PageHeader.vue';
  import Search from '../../components/form_controls/Search.vue';
  import Select from '../../components/form_controls/Select.vue';
  import BtnIcon from '../../components/buttons/Icon.vue';

  import DrawerContainer from '../../components/drawer/Container.vue';
  import DrawerHeader from '../../components/drawer/Header.vue';
  import Details from './Details.vue';
  import Form from './Form.vue';

  document.title = 'Fund Sources';

  const { hasPermission, getOffices } = useGate();
  const { formatDateTime, formatCurrency } = useFormatter();
  const { getRecord } = useDB();

  const offices = getOffices(['fund_sources:manage', 'fund_sources:view']);
  
  const ag_grid = ref({
    api: null,
    row_data: [],
    col_defs: [
      {
        headerName: 'Name',
        field: 'name',
        sortable: true,
        flex: 2,
      },
      {
        headerName: 'Amount',
        field: 'amount',
        sortable: true,
        flex: 1,
        valueFormatter: params => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })
          .format(params.value),
        comparator: (num1, num2) => num1 - num2,
      },
      {
        headerName: 'Allocated',
        field: 'allocated',
        sortable: true,
        flex: 1,
        valueFormatter: params => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })
          .format(params.value),
        comparator: (num1, num2) => num1 - num2,
      },
      {
        headerName: 'Remaining',
        field: 'amount',
        sortable: true,
        flex: 1,
        valueFormatter: params => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })
          .format(params.data.amount - params.data.allocated),
        comparator: (num1, num2) => num1 - num2,
      },
      {
        headerName: 'Office',
        field: 'office.name',
        sortable: true,
        flex: 2,
      },
      {
        width: 100,
        cellRenderer: AgGridActionsCol,
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
    title: null,
    controls: {},
    component: '',
    data: null,
  });

  const loadData = year => {
    ag_grid.value.api.showLoadingOverlay();

    getRecord(`${import.meta.env.VITE_API_URL}/fund_sources?year=${year}`, response => {
      ag_grid.value.row_data = response.data.map(data => {
        return {
          ...data,
          office: offices.value.find(office => office.id === data.office_id),
        }
      });
    });
  };
  
  const onGridReady = params => {
    ag_grid.value.api = params.api;
    loadData(ag_grid.value.year);
  };

  const showDetails = async (id) => {
    resetDrawer();
    await getRecord(`${import.meta.env.VITE_PORTAL_API_URL}/users/${id}`, response => data.user = response.data);

    drawer.value.title = 'Fund Source Details';
    drawer.value.component = 'details';
    drawer.value.data = { id };
    drawer.value.show = true;
  };
  
  const showForm = id => {
    drawer.value.title = id ? 'Update Fund Source' : 'Create Fund Source';
    drawer.value.component = 'form';
    drawer.value.data = { id };
    drawer.value.show = true;
  };
  
  // const showDelete = id => {
  //   drawer.value.data = { id, offices: offices.value };
  //   drawer.value.component = shallowRef(DeleteDialog);
  //   drawer.value.show = true;
  // };

  const resetDrawer = () => {
    drawer.value.show = false;
    drawer.value.component = '';
    drawer.value.data = null;
    drawer.value.title = '';
  };
  
  // const createdFundSource = new_data => {
  //   new_data.office = offices.value.find(office => office.id === new_data.office_id);
  //   ag_grid.value.api.applyTransaction({ add: [new_data], addIndex: 0 });
  //   resetDrawer();
  // };
  
  // const updatedFundSource = new_data => {
  //   new_data.office = offices.value.find(office => office.id === new_data.office_id);
  //   ag_grid.value.api.applyTransaction({ update: [new_data] });
  //   resetDrawer();
  // };
  
  const deletedFundSource = id => {
    ag_grid.value.row_data.some((fund_source, index) => {
      if (fund_source.id === id) {
        ag_grid.value.row_data.splice(index, 1);
        return true;
      }
    });
    
    resetDrawer();
  };
  
  await getRecord(`${import.meta.env.VITE_PORTAL_API_URL}/offices`, response => {
      offices.value = offices.map(office_id => response.data.find(data => data.id === office_id));
  });
  
  watch(() => ag_grid.value.filter_text, text => ag_grid.value.api.setQuickFilter(text));
  watch(() => ag_grid.value.year, year => loadData(year));
</script>

<template>
  <div class="w-full h-full flex items-stretch">
    <div class="flex-grow flex flex-col px-12">
      <PageHeader :title="'Fund Sources'">
        <template #controls>
          <div class="flex items-center space-x-2">
            <BtnIcon @click="showForm()" :icon="'fas fa-folder-plus'" class="bg-white text-gray-600 hover:text-primary-600" title="Add" />
            <Search v-model:value="ag_grid.filter_text" />
            <Select v-model:value="ag_grid.year" :options="ag_grid.years" />
          </div>
        </template>
      </PageHeader>
    
      <AgGridVue
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
    
    <DrawerContainer :show="drawer.show" :controls="drawer.controls">
      <DrawerHeader
        v-if="drawer.title" 
        :title="drawer.title"
        @close="resetDrawer"
      />

      <Details 
        v-if="drawer.component === 'details'" 
        :data="drawer.data" 
        @edit="showForm"
      />

      <Form 
        v-if="drawer.component === 'form'"
        :data="drawer.data"
      />
    </DrawerContainer>
  </div>
</template>