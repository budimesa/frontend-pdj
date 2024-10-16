<template>
    <div class="card">
      <h1 class="text-2xl font-bold mb-4">Inventory Management</h1>
      <Toolbar class="mb-6">
        <template #start>
          <!-- <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="createNew" /> -->
        </template>
        <template #end>
          <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
        </template>
      </Toolbar>
      <DataTable v-model:filters="filters" scrollable :value="inventoryStore.items" showGridlines :rows="10" dataKey="id"
            filterDisplay="menu" :globalFilterFields="['incoming_item_code', 'description', 'batch_code']">
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
                <span>No Incoming Items found.</span>
            </div>
        </template>
        <Column header="No." style="min-width: 4rem">
            <template #body="{ index }">
                {{ inventoryStore.pagination.offset + index + 1 }}
            </template>
        </Column>
        <Column field="warehouse_name" header="Warehouse Name" style="min-width: 15rem">
          <template #body="{ data }">
            {{ data.warehouse_name }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Warehouse Name" />
          </template>
        </Column>   
        <Column field="incoming_item_code" header="Incoming Item Code" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.incoming_item_code }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by incoming item code" />
          </template>
        </Column>

        <Column field="batch_code" header="Batch Code" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.batch_code }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Batch Code" />
          </template>
        </Column>

        <Column field="concat_code_name" header="Item" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.concat_code_name }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Item" />
          </template>
        </Column>
  
        <Column field="description" header="Description" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.description }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Description" />
          </template>
        </Column>

        <Column field="net_weight" header="Net (KG)" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.net_weight }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Net Weight" />
          </template>
        </Column>

        <Column field="initial_stock" header="Initial Stock" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.initial_stock }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Initial Stock" />
          </template>
        </Column>

        <Column field="available_stock" header="Available Stock" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.available_stock }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Available Stock" />
          </template>
        </Column>

        <Column field="actual_stock" header="Actual Stock" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.actual_stock }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Actual Stock" />
          </template>
        </Column>

        <Column field="unit_price" header="Unit Price" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.unit_price }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Unit Price" />
          </template>
        </Column>

        <Column field="total_price" header="Total Price" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.total_price }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Total Price" />
          </template>
        </Column>

        <Column field="labor_cost" header="Labor Cost" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.labor_cost }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Labor Cost" />
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
  
        <!-- <Column :exportable="false" header="Tindakan" alignFrozen="right" frozen>
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="edit(slotProps.data)" />
            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDelete(slotProps.data)" />
          </template>
        </Column> -->
      </DataTable>

      <Paginator
        v-model:rows="inventoryStore.rows"
        :totalRecords="inventoryStore.totalRecords"
        :first="inventoryStore.first"
        :rowsPerPageOptions="[10, 20, 30]"
        @page="handlePageChange"
      ></Paginator>
    </div>

    <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="item">Apakah anda yakin ingin menghapus <b>{{ item.description }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteDialog = false" />
        <Button label="Yes" icon="pi pi-check" @click="deleteItem(item.id)" :disabled="isDeleting"/>
      </template>
    </Dialog>
  </template>

<script setup>
import { useInventoryStore } from '@/stores/inventory';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { useDebounce } from '@vueuse/core';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const toast = useToast();
const dt = ref();
const formDialog = ref(false);
const deleteDialog = ref(false);
const filters = ref({});
const submitted = ref(false);
const isEditMode = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const inventoryStore = useInventoryStore();
const router = useRouter();
const debouncedFilters = useDebounce(filters, 300);

watch(debouncedFilters, () => {
    fetchData(1); // Fetch data for the current page when filters change
  }, { deep: true }); 

const item = ref({});

const fetchData = async (page = 1) => {
    await inventoryStore.fetchInventories(page, filters.value);
  };
  
  const handlePageChange = (event) => {  
    fetchData(event.page + 1);
  };
  
  // Watch for changes in rows
  watch(inventoryStore.rows, () => {  
    fetchData(1); // Fetch data for the first page with the new per_page value
  });
  
  onMounted(() => {  
    fetchData();
  });

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        description: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        batch_code: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        incoming_item_code: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        // notes: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
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
    item.value = { incoming_item_code: '', description: '', notes: '' };
    submitted.value = false;
    isEditMode.value = false;
};

const openNew = () => {
    formDialog.value = true;
    resetForm();
};

const hideDialog = () => {
  formDialog.value = false;
  resetForm();
};

const confirmDelete = (item) => {
  item.value = item;
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

