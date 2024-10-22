<template>
    <div class="card">
      <h1 class="text-2xl font-bold mb-4">Menu Repack Eceran</h1>
      <Toolbar class="mb-6">
        <template #start>
          <Button label="Tambah" icon="pi pi-plus" severity="success" class="mr-2" @click="createNew" />
        </template>
        <template #end>
          <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
        </template>
      </Toolbar>
      <DataTable v-model:filters="filters" scrollable :value="incomingItemStore.items" showGridlines :rows="10" dataKey="id"
            filterDisplay="menu" :globalFilterFields="['incoming_item_code', 'supplier_name']">
        <template #header>
            <div class="flex justify-between">
                <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
                <IconField>
                    <InputIcon>
                        <i class="pi pi-search" />
                    </InputIcon>
                    <InputText v-model="filters['global'].value" placeholder="Masukkan Kata Kunci" fluid />
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
                {{ incomingItemStore.pagination.offset + index + 1 }}
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
  
        <Column field="supplier_name" header="Supplier" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.supplier_name }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Supplier" />
          </template>
        </Column>
  
        <Column field="notes" header="Notes" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.notes }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Keterangan" />
          </template>
        </Column>
  
        <Column :exportable="false" header="Aksi" alignFrozen="right" style="min-width: 8rem" frozen>
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="edit(slotProps.data)" />
            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDelete(slotProps.data)" />
          </template>
        </Column>
      </DataTable>

      <Paginator
        v-model:rows="incomingItemStore.rows"
        :totalRecords="incomingItemStore.totalRecords"
        :first="incomingItemStore.first"
        :rowsPerPageOptions="[10, 20, 30]"
        @page="handlePageChange"
      ></Paginator>
    </div>

    <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="item">Apakah anda yakin ingin menghapus <b>{{ item.supplier_name }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteDialog = false" />
        <Button label="Yes" icon="pi pi-check" @click="deleteItem(item.id)" :disabled="isDeleting"/>
      </template>
    </Dialog>
  </template>

<script setup>
import { useIncomingItemStore } from '@/stores/incomingItem';
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
const incomingItemStore = useIncomingItemStore();
const router = useRouter();
const debouncedFilters = useDebounce(filters, 300);

watch(debouncedFilters, () => {
    fetchData(1); // Fetch data for the current page when filters change
  }, { deep: true }); 

const createNew = () => {
  router.push('/pages/repacks/create');
};

const edit = async (incomingItem) => {
    router.push({ name: 'incoming-items.edit', params: { id: incomingItem.id } });
  };

const item = ref({});

const fetchData = async (page = 1) => {
    await incomingItemStore.fetchIncomingItems(page, filters.value);
  };
  
  const handlePageChange = (event) => {  
    fetchData(event.page + 1);
  };
  
  // Watch for changes in rows
  watch(() => incomingItemStore.rows, () => {  
    fetchData(1); // Fetch data for the first page with the new per_page value
  });
  
  onMounted(() => {  
    fetchData();
  });

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        supplier_name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
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
    item.value = { incoming_item_code: '', supplier_name: '', notes: '' };
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

const save = async () => {
  submitted.value = true;
  
  // Check for required fields
  if (!item.value.supplier_name || !item.value.incoming_item_code) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Harap isi semua kolom yang wajib diisi.', life: 3000 });
    return;
  }
  isSaving.value = true; 
  try {
      if (isEditMode.value) {
        await itemStore.updateItem(item.value);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Barang masuk berhasil diperbarui', life: 3000 });
      } else {
        await itemStore.createItem(item.value);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Barang masuk berhasil dibuat', life: 3000 });
      }
      fetchItems();
      hideDialog();
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal menyimpan barang masuk', life: 3000 });
    } finally {
      isSaving.value = false; // Set to false after the process is complete
    }
};


const confirmDelete = (item) => {
  item.value = item;
  deleteDialog.value = true;
};

const deleteItem = async (id) => {
   isDeleting.value = true; // Set loading state before deletion
    try {
        await itemStore.deleteItem(id);
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Barang masuk berhasil dihapus', life: 3000 });
        fetchItems();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal menghapus barang masuk', life: 3000 });
    } finally {
        deleteDialog.value = false;
        isDeleting.value = false; // Reset loading state after the process
    }
};

const exportCSV = () => {
  dt.value.exportCSV();
};

</script>

