<template>
    <div class="card">
      <h1 class="text-2xl font-bold mb-4">Warehouse Management</h1>
      <Toolbar class="mb-6">
        <template #start>
          <Button label="Tambah" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
        </template>
        <template #end>
          <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
        </template>
      </Toolbar>
      <DataTable v-model:filters="filters" :value="warehouseStore.warehouses" paginator showGridlines :rows="10" dataKey="id"
                 filterDisplay="menu" :globalFilterFields="['warehouse_code', 'warehouse_name']">
        <template #header>
          <div class="flex justify-between">
            <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
            </IconField>
          </div>
        </template>
        <template #empty>
          <div class="flex items-center justify-center h-full">
              <span>No Warehouses found.</span>
          </div>
        </template>  
        <Column field="warehouse_code" header="Warehouse Code" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.warehouse_code }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by warehouse code" />
          </template>
        </Column>
  
        <Column field="warehouse_name" header="Warehouse Name" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.warehouse_name }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by warehouse name" />
          </template>
        </Column>
  
        <Column field="location" header="Location" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.location }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by location" />
          </template>
        </Column>
  
        <Column header="Created At" filterField="created_at" dataType="date" style="min-width: 12rem">
          <template #body="{ data }">
            {{ formatDate(data.created_at) }}
          </template>
          <template #filter="{ filterModel }">
            <DatePicker v-model="filterModel.value" dateFormat="dd/mm/yy" placeholder="dd/mm/yyyy" />
          </template>
        </Column>
  
        <Column header="Updated At" field="updated_at" style="min-width: 12rem">
          <template #body="{ data }">
            {{ formatDate(data.updated_at) }}
          </template>
          <template #filter="{ filterModel }">
            <DatePicker v-model="filterModel.value" dateFormat="dd/mm/yy" placeholder="dd/mm/yyyy" />
          </template>
        </Column>
  
        <Column :exportable="false" header="Tindakan" alignFrozen="right" style="min-width: 12rem" frozen>
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="edit(slotProps.data)" />
            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDelete(slotProps.data)" />
          </template>
        </Column>
      </DataTable>
    </div>
  
    <Dialog v-model:visible="formDialog" :style="{ width: '450px' }" header="Warehouse Details" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="warehouse_code" class="block font-bold mb-3">Warehouse Code</label>
          <!-- <InputText id="warehouse_code" v-model="formData.warehouse_code" required fluid /> -->
          <InputText id="warehouse_code" v-model="formData.warehouse_code" required fluid />
          <small v-if="submitted && !formData.warehouse_code" class="text-red-500">Warehouse Code is required.</small>
        </div>
        <div>
          <label for="warehouse_name" class="block font-bold mb-3">Warehouse Name</label>
          <InputText id="warehouse_name" v-model="formData.warehouse_name" required fluid />
          <small v-if="submitted && !formData.warehouse_name" class="text-red-500">Warehouse Name is required.</small>
        </div>
        <div>
          <label for="location" class="block font-bold mb-3">location</label>
          <InputText id="location" v-model="formData.location" fluid />
        </div>
      </div>
  
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" @click="save" :disabled="isSaving" />
      </template>
    </Dialog>
  
    <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="formData">Are you sure you want to delete <b>{{ formData.warehouse_name }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteDialog = false" />
        <Button label="Yes" icon="pi pi-check" @click="deleteWarehouse(formData.id)" :disabled="isDeleting"/>
      </template>
    </Dialog>
  </template>

<script setup>
import { useWarehouseStore } from '@/stores/warehouse';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const formDialog = ref(false);
const deleteDialog = ref(false);
const filters = ref({});
const submitted = ref(false);
const isEditMode = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const warehouseStore = useWarehouseStore();

const formData = ref({ warehouse_code: '', warehouse_name: '',  location: '' });
const fetchWarehouses = async () => {
    await warehouseStore.fetchWarehouses();
};

onMounted(() => {
    fetchWarehouses();
});

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        warehouse_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        warehouse_code: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        location: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        created_at: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
    };
};

initFilters();

const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB');
};

const clearFilter = () => {
    initFilters();
};

const resetForm = () => {
    formData.value = { warehouse_code: '', warehouse_name: '', location: '' };
    submitted.value = false;
    isEditMode.value = false;
};

const openNew = () => {
    formDialog.value = true;
    resetForm();
};

const edit = (warehouseData) => {
  formData.value = { ...warehouseData };
  submitted.value = false;
  isEditMode.value = true;
  formDialog.value = true;
};

const hideDialog = () => {
  formDialog.value = false;
  resetForm();
};

const save = async () => {
  submitted.value = true;
  
  // Check for required fields
  if (!formData.value.warehouse_name || !formData.value.warehouse_code) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Please fill in all required fields.', life: 3000 });
    return;
  }
  isSaving.value = true; 
  try {
      if (isEditMode.value) {
        await warehouseStore.updateWarehouse(formData.value);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Warehouse updated successfully', life: 3000 });
      } else {
        console.log(formData.value)
        await warehouseStore.createWarehouse(formData.value);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Warehouse created successfully', life: 3000 });
      }
      fetchWarehouses();
      hideDialog();
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save warehouse', life: 3000 });
    } finally {
      isSaving.value = false; // Set to false after the process is complete
    }
};


const confirmDelete = (warehouse) => {
  formData.value = warehouse;
  deleteDialog.value = true;
};

const deleteWarehouse = async (id) => {
   isDeleting.value = true; // Set loading state before deletion
    try {
        await warehouseStore.deleteWarehouse(id);
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Warehouse Deleted', life: 3000 });
        fetchWarehouses();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete warehouse', life: 3000 });
    } finally {
        deleteDialog.value = false;
        isDeleting.value = false; // Reset loading state after the process
    }
};

const exportCSV = () => {
  dt.value.exportCSV();
};

</script>

