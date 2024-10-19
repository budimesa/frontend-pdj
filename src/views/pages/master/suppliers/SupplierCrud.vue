<template>
    <div class="card">
      <h1 class="text-2xl font-bold mb-4">Manajemen Supplier</h1>
      <Toolbar class="mb-6">
        <template #start>
          <Button label="Tambah" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
        </template>
        <template #end>
          <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
        </template>
      </Toolbar>
      <DataTable v-model:filters="filters" :value="supplierStore.suppliers" paginator showGridlines :rows="10" dataKey="id"
                 filterDisplay="menu" :globalFilterFields="['supplier_code', 'supplier_name']">
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
                <span>No Suppliers found.</span>
            </div>
        </template>
        <Column field="supplier_code" header="Kode Supplier" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.supplier_code }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Kode Supplier" />
          </template>
        </Column>
  
        <Column field="supplier_name" header="Nama Supplier" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.supplier_name }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Nama Supplier" />
          </template>
        </Column>
  
        <Column field="supplier_type" header="Tipe Supplier" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.supplier_type }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Tipe Supplier" />
          </template>
        </Column>
  
        <Column field="phone_number" header="Nomor HP" style="min-width: 12rem">
          <template #body="{ data }">
            {{ data.phone_number }}
          </template>
          <template #filter="{ filterModel }">
            <InputText v-model="filterModel.value" type="text" placeholder="Search by Nomor HP" />
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

        <Column :exportable="false" header="Aksi" alignFrozen="right" frozen style="min-width: 12rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="edit(slotProps.data)" />
            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDelete(slotProps.data)" />
          </template>
        </Column>
      </DataTable>
    </div>
  
    <Dialog v-model:visible="formDialog" :style="{ width: '450px' }" header="Supplier Details" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="supplier_type" class="block font-bold mb-3">Tipe Supplier</label>          
            <Dropdown
            v-model="formData.supplier_type"
            :options="supplierTypes"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Tipe Supplier"
            class="w-full"
            />
          <!-- <small v-if="submitted && !formData.supplier_type" class="text-red-500">Tipe Supplier wajib diisi.</small> -->
        </div>
        <div>
          <label for="supplier_code" class="block font-bold mb-3">Kode Supplier</label>
          <!-- <InputText id="supplier_code" v-model="formData.supplier_code" required fluid /> -->
          <InputText 
            id="supplier_code" 
            v-model="formData.supplier_code" 
            :disabled="isNonRegular"
            required
            fluid 
            />
          <small v-if="submitted && !formData.supplier_code" class="text-red-500">Kode Supplier wajib diisi.</small>
        </div>
        <div>
          <label for="supplier_name" class="block font-bold mb-3">Nama Supplier</label>
          <InputText id="supplier_name" v-model="formData.supplier_name" required fluid />
          <small v-if="submitted && !formData.supplier_name" class="text-red-500">Nama Supplier wajib diisi.</small>
        </div>
        <div>
          <label for="phone_number" class="block font-bold mb-3">Nomor HP</label>
          <InputText id="phone_number" v-model="formData.phone_number" fluid />
        </div>
        <div>
          <label for="address" class="block font-bold mb-3">Alamat</label>
          <InputText id="address" v-model="formData.address" fluid />
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
        <span v-if="formData">Apakah anda yakin ingin menghapus <b>{{ formData.supplier_name }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteDialog = false" />
        <Button label="Yes" icon="pi pi-check" @click="deleteSupplier(formData.id)" :disabled="isDeleting"/>
      </template>
    </Dialog>
  </template>

<script setup>
import { useSupplierStore } from '@/stores/supplier';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch } from 'vue';

const toast = useToast();
const dt = ref();
const formDialog = ref(false);
const deleteDialog = ref(false);
const filters = ref({});
const submitted = ref(false);
const isEditMode = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const supplierStore = useSupplierStore();
const supplierTypes = [
  { label: 'Regular', value: 'regular' },
  { label: 'Non-Regular', value: 'non-regular' },
];

const formData = ref({ supplier_type: 'regular', supplier_code: '', supplier_name: '', phone_number: '', address: '' });
const isNonRegular = ref(false);

// Watcher untuk mengupdate supplier_code
watch(
  () => formData.value.supplier_type,
  (newValue) => {
    if (newValue === 'non-regular') {
      formData.value.supplier_code = 'KPK';
      isNonRegular.value = true;
    } else {
      formData.value.supplier_code = '';
      isNonRegular.value = false;
    }
  }
);

const fetchSuppliers = async () => {
    await supplierStore.fetchSuppliers();
};

onMounted(() => {
    fetchSuppliers();
});

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        supplier_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        supplier_code: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        phone_number: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
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
    formData.value = { supplier_type: 'regular', supplier_code: '', supplier_name: '', phone_number: '', address: '' };
    submitted.value = false;
    isEditMode.value = false;
};

const openNew = () => {
    formDialog.value = true;
    resetForm();
};
  
const edit = (supplierData) => {
  formData.value = { ...supplierData };
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
  if (!formData.value.supplier_name || !formData.value.supplier_type) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Harap isi semua kolom yang wajib diisi.', life: 3000 });
    return;
  }
  
  if (formData.value.supplier_type === 'non-regular' && !formData.value.supplier_code) {
    formData.value.supplier_code = 'KPK'; // Ensure supplier_code is set if non-regular
  }

  isSaving.value = true; 
  try {
      if (isEditMode.value) {
        await supplierStore.updateSupplier(formData.value);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Supplier updated successfully', life: 3000 });
      } else {
        console.log(formData.value)
        await supplierStore.createSupplier(formData.value);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Supplier created successfully', life: 3000 });
      }
      fetchSuppliers();
      hideDialog();
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save supplier', life: 3000 });
    } finally {
      isSaving.value = false; // Set to false after the process is complete
    }
};


const confirmDelete = (supplier) => {
  formData.value = supplier;
  deleteDialog.value = true;
};

const deleteSupplier = async (id) => {
   isDeleting.value = true; // Set loading state before deletion
    try {
        await supplierStore.deleteSupplier(id);
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Supplier Deleted', life: 3000 });
        fetchSuppliers();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete supplier', life: 3000 });
    } finally {
        deleteDialog.value = false;
        isDeleting.value = false; // Reset loading state after the process
    }
};

const exportCSV = () => {
  dt.value.exportCSV();
};

</script>

