<template>
    <div class="card">
      <h1 class="text-2xl font-bold mb-4">Transfer Barang</h1>
      <Toolbar class="mb-6">
        <template #start>
          <Button label="Tambah" icon="pi pi-plus" severity="success" class="mr-2" @click="createNew" />
        </template>
        <template #end>
          <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
        </template>
      </Toolbar>
      <DataTable v-model:filters="filters" scrollable :value="itemTransferStore.items" showGridlines :rows="10" dataKey="id"
            filterDisplay="menu" :globalFilterFields="['incoming_item_code', 'from_warehouse_name']">
        <template #header>
            <div class="flex justify-between">
                <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
                <IconField>
                    <InputIcon>
                        <i class="pi pi-search" />
                    </InputIcon>
                    <InputText v-model="filters['global'].value" placeholder="Masukkan Kata Kunci" />
                </IconField>
            </div>
        </template>        
        <template #empty>
            <div class="flex items-center justify-center h-full">
                <span>No Transfer Items found.</span>
            </div>
        </template>
        <Column header="No." style="min-width: 4rem">
            <template #body="{ index }">
                {{ itemTransferStore.pagination.offset + index + 1 }}
            </template>
        </Column>          
        <Column field="transfer_code" header="Kode Transfer" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.transfer_code }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Kode Transfer" />
          </template>
        </Column>  
        <Column field="from_warehouse_name" header="Gudang Asal" style="min-width: 13rem">
          <template #body="{ data }">
            {{ data.from_warehouse_name }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Gudang Asal" />
          </template>
        </Column>
        <Column field="to_warehouse_name" header="Gudang Tujuan" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.to_warehouse_name }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Gudang Tujuan" />
          </template>
        </Column>  
        <Column field="total_quantity" header="Jumlah Barang" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.total_quantity }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Jumlah Barang" />
          </template>
        </Column>

        <Column field="transfer_status" header="Status" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.transfer_status }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Status" />
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
  
        <Column :exportable="false" header="Aksi" alignFrozen="right" frozen style="min-width: 8rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="edit(slotProps.data)" />
            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDelete(slotProps.data)" />
          </template>
        </Column>
      </DataTable>

      <Paginator
        v-model:rows="itemTransferStore.rows"
        :totalRecords="itemTransferStore.totalRecords"
        :first="itemTransferStore.first"
        :rowsPerPageOptions="[10, 20, 30]"
        @page="handlePageChange"
      ></Paginator>
    </div>

    <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="item">Apakah anda yakin ingin menghapus <b>{{ item.transfer_code }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteDialog = false" />
        <Button label="Yes" icon="pi pi-check" @click="deleteItem(item.id)" :disabled="isDeleting"/>
      </template>
    </Dialog>
  </template>

<script setup>
import { useItemTransferStore } from '@/stores/itemTransfer';
import { FilterMatchMode } from '@primevue/core/api';
import { useDebounce } from '@vueuse/core';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const toast = useToast();
const dt = ref();
const deleteDialog = ref(false);
const filters = ref({});
const isDeleting = ref(false);
const itemTransferStore = useItemTransferStore();
const router = useRouter();
const debouncedFilters = useDebounce(filters, 300);

watch(debouncedFilters, () => {
    fetchData(1); // Fetch data for the current page when filters change
  }, { deep: true }); 

const createNew = () => {
  router.push('/pages/item-transfers/create');
};

const edit = async (itemTransfer) => {
    router.push({ name: 'item-transfers.edit', params: { id: itemTransfer.id } });
  };

const item = ref({});

const fetchData = async (page = 1) => {
    await itemTransferStore.fetchItemTransfers(page, filters.value);
  };
  
  const handlePageChange = (event) => {  
    fetchData(event.page + 1);
  };
  
  // Watch for changes in rows
  watch(() => itemTransferStore.rows, () => {  
    fetchData(1); // Fetch data for the first page with the new per_page value
  });
  
  onMounted(() => {  
    fetchData();
  });

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        from_warehouse_name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        to_warehouse_name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        incoming_item_code: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        // notes: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
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

