<template>
    <div class="card">
      <h1 class="text-2xl font-bold mb-4">Master Barang</h1>
      <Toolbar class="mb-6">
        <template #start>
          <Button label="Tambah" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
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
              <InputText v-model="filters['global'].value" placeholder="Masukkan Kata Kunci" fluid />
            </IconField>
          </div>
        </template>        
        <template #empty>
            <div class="flex items-center justify-center h-full">
                <span>Data tidak ditemukan.</span>
            </div>
        </template>
        <Column field="item_code" header="Kode Barang" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.item_code }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Kode Barang" />
          </template>
        </Column>
  
        <Column field="item_name" header="Nama Barang" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.item_name }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Nama Barang" />
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

        <Column field="sale_unit" header="Satuan Barang" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.sale_unit }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Satuan Barang" />
          </template>
        </Column>
  
        <Column :exportable="false" header="Aksi" alignFrozen="right" style="min-width: 12rem" frozen>
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="edit(slotProps.data)" />
            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDelete(slotProps.data)" />
          </template>
        </Column>
      </DataTable>
    </div>
  
    <Dialog v-model:visible="formDialog" :style="{ width: '450px' }" header="Detail Barang" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="item_code" class="block font-bold mb-3">Kode Barang</label>
          <!-- <InputText id="item_code" v-model="formData.item_code" required fluid /> -->
          <InputText id="item_code" v-model="formData.item_code" required fluid />
          <small v-if="submitted && !formData.item_code" class="text-red-500">Kode Barang wajib diisi.</small>
        </div>
        <div>
          <label for="item_name" class="block font-bold mb-3">Nama Barang</label>
          <InputText id="item_name" v-model="formData.item_name" required fluid />
          <small v-if="submitted && !formData.item_name" class="text-red-500">Nama Barang wajib diisi.</small>
        </div>
        <div>
          <label for="notes" class="block font-bold mb-3">Keterangan</label>
          <InputText id="notes" v-model="formData.notes" fluid />
        </div>
        <div>
          <label for="sale_unit" class="block font-bold mb-3">Satuan Barang</label>          
            <Dropdown
            v-model="formData.sale_unit"
            :options="saleUnits"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Satuan Barang"
            class="w-full"
            />
        </div>
      </div>
  
      <template #footer>
        <Button label="Batal" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Simpan" icon="pi pi-check" @click="save" :disabled="isSaving" />
      </template>
    </Dialog>
  
    <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="formData">Apakah anda yakin ingin menghapus <b>{{ formData.item_name }}</b>?</span>
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

const saleUnits = [
  { label: 'Dus', value: 'Dus' },
  { label: 'Keranjang', value: 'Keranjang' },
  { label: 'Karung', value: 'Karung' },
  { label: 'Plastik', value: 'Plastik' },
];

const formData = ref({ item_code: '', item_name: '',  notes: '', sale_unit: '' });
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
        sale_unit: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
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
    formData.value = { item_code: '', item_name: '', notes: '', sale_unit: '' };
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
    toast.add({ severity: 'error', summary: 'Error', detail: 'Harap isi semua kolom yang wajib diisi.', life: 3000 });
    return;
  }
  isSaving.value = true; 
  try {
      if (isEditMode.value) {
        await itemStore.updateItem(formData.value);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Barang berhasil diperbarui', life: 3000 });
      } else {
        console.log(formData.value)
        await itemStore.createItem(formData.value);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Barang berhasil dibuat', life: 3000 });
      }
      fetchItems();
      hideDialog();
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal menyimpan barang', life: 3000 });
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
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Barang berhasil dihapus', life: 3000 });
        fetchItems();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal menghapus barang', life: 3000 });
    } finally {
        deleteDialog.value = false;
        isDeleting.value = false; // Reset loading state after the process
    }
};

const exportCSV = () => {
  dt.value.exportCSV();
};

</script>

