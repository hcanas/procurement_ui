<script setup>
  import { ref, watch } from 'vue';
  import { useGate } from '../../composables/gate';
  import { useDB } from '../../composables/db';
  
  import "ag-grid-community/styles/ag-grid.css";
  import "ag-grid-community/styles/ag-theme-material.min.css";
  import { AgGridVue } from "ag-grid-vue3";
  import AgGridLoadingComponent from '../../components/loaders/Loading.vue';
  // import AgGridActionsCol from './AgGridActionsCol.vue';
  
  import PageHeader from '../../components/PageHeader.vue';
  import Search from '../../components/form_controls/Search.vue';
  import Select from '../../components/form_controls/Select.vue';
  import BtnPrimary from '../../components/buttons/Primary.vue';

  import Popover from '../../components/popovers/Details.vue';
  import Details from './Details.vue';

  import DrawerContainer from '../../components/drawer/Container.vue';
  import DrawerHeader from '../../components/drawer/Header.vue';
  import Form from './Form.vue';

  import AlertSuccess from '../../components/alerts/Success.vue';
  import AlertError from '../../components/alerts/Error.vue';

  document.title = 'Fund Sources';

  const { getOffices } = useGate();
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
      // {
      //   width: 100,
      //   cellRenderer: AgGridActionsCol,
      //   cellRendererParams: {
      //     clicked: id => showDetails(id),
      //   },
      // },
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

  const popover = ref({
    show: false,
    title: '',
    data: null,
  });
  
  const drawer = ref({
    show: false,
    title: null,
    controls: {},
    component: '',
    data: null,
  });

  const alert = ref({
    show: false,
    type: '',
    message: '',
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

  const resetPopover = () => {
    popover.value = {
      show: false,
      data: null,
    };
  };

  const resetDrawer = () => {
    drawer.value.component = 'placeholder';
    drawer.value.data = null;
    drawer.value.title = '';
    drawer.value.show = false;
  };

  const resetAlert = () => {
    alert.value = {
      show: false,
      type: '',
      message: '',
    };
  };

  const showAlert = new_alert => {
    resetAlert();
    alert.value = {
      show: true,
      type: new_alert.type,
      message: new_alert.message,
    };
  };

  const showDetails = data => {
    console.log(data);
    resetPopover();
    popover.value = {
      show: true,
      title: 'Fund Source Details',
      data,
    };
  };
  
  const showForm = id => {
    resetDrawer();
    
    drawer.value.title = id ? 'Update Fund Source' : 'Create Fund Source';
    drawer.value.component = 'form';
    drawer.value.data = { id };
    drawer.value.show = true;
  };
  
  const createdFundSource = new_data => {
    new_data.office = offices.value.find(office => office.id === new_data.office_id);
    ag_grid.value.api.applyTransaction({ add: [new_data], addIndex: 0 });
    resetDrawer();
  };
  
  const updatedFundSource = new_data => {
    new_data.office = offices.value.find(office => office.id === new_data.office_id);
    ag_grid.value.api.applyTransaction({ update: [new_data] });
    resetDrawer();

    if (popover.value.data.id === new_data.id) popover.value.data = new_data;
  };
  
  const deletedFundSource = id => {
    ag_grid.value.row_data.some((fund_source, index) => {
      if (fund_source.id === id) {
        ag_grid.value.row_data.splice(index, 1);
        return true;
      }
    });

    resetDrawer();
    resetPopover();
  };
  
  await getRecord(`${import.meta.env.VITE_PORTAL_API_URL}/offices`, response => {
    offices.value = offices.map(office_id => response.data.find(data => data.id === office_id));
  });
  
  watch(() => ag_grid.value.filter_text, text => ag_grid.value.api.setQuickFilter(text));
  watch(() => ag_grid.value.year, year => loadData(year));

  const clicked = params => {
    console.log(params);
  };
</script>

<template>
  <AlertSuccess 
    v-if="alert.show && alert.type === 'success'"
    :message="alert.message"
    @close="resetAlert"
  />

  <AlertError 
    v-if="alert.show && alert.type === 'error'"
    :message="alert.message"
    @close="resetAlert"
  />

  <Popover 
    v-if="popover.show"
    :title="popover.title"
    @close="resetPopover"
  >
    <Details 
      :data="popover.data"
      :key="popover.data"
      @edit="showForm"
      @deleted="deletedFundSource"
      @alert="showAlert"
    />
  </Popover>

  <div class="w-full h-full flex items-stretch">
    <div class="flex-grow flex flex-col px-12">
      <PageHeader :title="'Fund Sources'">
        <template #controls>
          <div class="flex items-center space-x-2">
            <BtnPrimary @click="showForm()" :icon="'fas fa-folder-plus'" :text="'Add'" title="Add" />
            <Search v-model:value="ag_grid.filter_text" />
            <Select v-model:value="ag_grid.year" :options="ag_grid.years" />
          </div>
        </template>
      </PageHeader>
    
      <AgGridVue
        class="w-full flex-grow ag-theme-material"
        @grid-ready="onGridReady"
        @row-double-clicked="params => showDetails(params.data)"
        :rowData="ag_grid.row_data"
        :getRowId="params => params.data.id"
        :columnDefs="ag_grid.col_defs"
        :pagination="true"
        :paginationPageSize="20"
        :loadingOverlayComponent="AgGridLoadingComponent"
        :suppressCellFocus="true"
      />
    </div>
    
    <DrawerContainer 
      :show="drawer.show" 
      :controls="drawer.controls"
    >
      <DrawerHeader
        v-if="drawer.title" 
        :title="drawer.title"
        @close="resetDrawer"
      />

      <Form 
        v-if="drawer.component === 'form'"
        :data="drawer.data"
        :key="drawer.data.id"
        @created="createdFundSource"
        @updated="updatedFundSource"
        @return="showDetails"
        @alert="showAlert"
      />
    </DrawerContainer>
  </div>
</template>