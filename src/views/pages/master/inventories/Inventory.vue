<template>
    <div class="card">
      <h1 class="text-2xl font-bold mb-4">Menu Inventory</h1>
      <Toolbar class="mb-6">
        <template #start>
          <!-- <Button label="Tambah" icon="pi pi-plus" severity="success" class="mr-2" @click="createNew" /> -->
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
                <span>Data tidak ditemukan.</span>
            </div>
        </template>
        <Column header="No." style="min-width: 4rem">
            <template #body="{ index }">
                {{ inventoryStore.pagination.offset + index + 1 }}
            </template>
        </Column>
        <Column field="warehouse_name" header="Nama Gudang" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.warehouse_name }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Nama Gudang" />
          </template>
        </Column>   
        <Column field="incoming_item_code" header="Kode Barang Masuk" style="min-width: 15rem">
          <template #body="{ data }">
            {{ data.incoming_item_code }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Kode Barang Masuk" />
          </template>
        </Column>

        <Column field="batch_code" header="Kode Batch" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.batch_code }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Kode Batch" />
          </template>
        </Column>

        <Column field="concat_code_name" header="Barang" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.concat_code_name }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Barang" />
          </template>
        </Column>
  
        <Column field="description" header="Deskripsi" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.description }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Deskripsi" />
          </template>
        </Column>

        <Column field="net_weight" header="Net (KG)" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.net_weight }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Berat Net" />
          </template>
        </Column>

        <Column field="initial_stock" header="Stock Awal" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.initial_stock }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Stock Awal" />
          </template>
        </Column>

        <Column field="available_stock" header="Stock Tersedia" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.available_stock }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Stock Tersedia" />
          </template>
        </Column>

        <Column field="actual_stock" header="Stock Aktual" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.actual_stock }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Stock Aktual" />
          </template>
        </Column>

        <Column field="unit_price" header="Harga Satuan" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.unit_price }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Harga Satuan" />
          </template>
        </Column>

        <Column field="total_price" header="Total Harga" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.total_price }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Total Harga" />
          </template>
        </Column>

        <Column field="labor_cost" header="Ongkos Kuli" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.labor_cost }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Ongkos Kuli" />
          </template>
        </Column>
  
        <Column field="notes" header="Keterangan" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.notes }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Keterangan" />
          </template>
        </Column>
      </DataTable>

      <Paginator
        v-model:rows="inventoryStore.rows"
        :totalRecords="inventoryStore.totalRecords"
        :first="inventoryStore.first"
        :rowsPerPageOptions="[10, 20, 30]"
        @page="handlePageChange"
      ></Paginator>
    </div>
  </template>

<script setup>
import { useInventoryStore } from '@/stores/inventory';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { useDebounce } from '@vueuse/core';
import { onMounted, ref, watch } from 'vue';

const dt = ref();
const deleteDialog = ref(false);
const filters = ref({});
const isDeleting = ref(false);
const inventoryStore = useInventoryStore();
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

const exportCSV = () => {
  dt.value.exportCSV();
};

</script>

