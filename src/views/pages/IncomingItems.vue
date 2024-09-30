<template>
    <div class="card">
      <h1 class="text-2xl font-bold mb-4">Incoming Item Management</h1>
      <Toolbar class="mb-6">
        <template #start>
          <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
        </template>
        <template #end>
          <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
        </template>
      </Toolbar>
      <DataTable v-model:filters="filters" :value="itemStore.items" paginator showGridlines :rows="10" dataKey="id"
                 filterDisplay="menu" :globalFilterFields="['item_code', 'item_name']">
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
        <template #empty>No Items found.</template>
  
        <Column field="item_code" header="Item Code" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.item_code }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by item code" />
          </template>
        </Column>
  
        <Column field="item_name" header="Item Name" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.item_name }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by item name" />
          </template>
        </Column>
  
        <Column field="notes" header="Notes" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.notes }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by notes" />
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
  
        <Column :exportable="false" header="Actions" alignFrozen="right" frozen>
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="edit(slotProps.data)" />
            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDelete(slotProps.data)" />
          </template>
        </Column>
      </DataTable>
    </div>
  
    <Dialog v-model:visible="formDialog" :style="{ width: '450px' }" header="Item Details" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="item_code" class="block font-bold mb-3">Item Code</label>
          <!-- <InputText id="item_code" v-model="formData.item_code" required fluid /> -->
          <InputText id="item_code" v-model="formData.item_code" required fluid />
          <small v-if="submitted && !formData.item_code" class="text-red-500">Item Code is required.</small>
        </div>
        <div>
          <label for="item_name" class="block font-bold mb-3">Item Name</label>
          <InputText id="item_name" v-model="formData.item_name" required fluid />
          <small v-if="submitted && !formData.item_name" class="text-red-500">Item Name is required.</small>
        </div>
        <div>
          <label for="notes" class="block font-bold mb-3">Description</label>
          <InputText id="notes" v-model="formData.notes" fluid />
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
        <span v-if="formData">Are you sure you want to delete <b>{{ formData.item_name }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteDialog = false" />
        <Button label="Yes" icon="pi pi-check" @click="deleteItem(formData.id)" :disabled="isDeleting"/>
      </template>
    </Dialog>
  </template>

<script setup>
import { useItemStore } from '@/stores/item';
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
const itemStore = useItemStore();

const formData = ref({ item_code: '', item_name: '',  notes: '' });
const fetchItems = async () => {
    await itemStore.fetchItems();
};

onMounted(() => {
    fetchItems();
});

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        item_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        item_code: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        notes: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
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
    formData.value = { item_code: '', item_name: '', notes: '' };
    submitted.value = false;
    isEditMode.value = false;
};

const openNew = () => {
    formDialog.value = true;
    resetForm();
};

const edit = (itemData) => {
  formData.value = { ...itemData };
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
  if (!formData.value.item_name || !formData.value.item_code) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Please fill in all required fields.', life: 3000 });
    return;
  }
  isSaving.value = true; 
  try {
      if (isEditMode.value) {
        await itemStore.updateItem(formData.value);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Item updated successfully', life: 3000 });
      } else {
        console.log(formData.value)
        await itemStore.createItem(formData.value);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Item created successfully', life: 3000 });
      }
      fetchItems();
      hideDialog();
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save item', life: 3000 });
    } finally {
      isSaving.value = false; // Set to false after the process is complete
    }
};


const confirmDelete = (item) => {
  formData.value = item;
  deleteDialog.value = true;
};

const deleteItem = async (id) => {
   isDeleting.value = true; // Set loading state before deletion
    try {
        await itemStore.deleteItem(id);
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Item Deleted', life: 3000 });
        fetchItems();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete item', life: 3000 });
    } finally {
        deleteDialog.value = false;
        isDeleting.value = false; // Reset loading state after the process
    }
};

const exportCSV = () => {
  dt.value.exportCSV();
};

</script>

