<script setup>
import { useCustomerStore } from '@/stores/customer';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const formDialog = ref(false);
const deleteDialog = ref(false);
const filters = ref({});
const submitted = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const customerStore = useCustomerStore();
const customerTypes = [
  { label: 'Regular', value: 'regular' },
  { label: 'Non-Regular', value: 'non-regular' },
];

onMounted(() => {
  customerStore.fetchCustomers();
});

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        customer_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        phone_number: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        created_at: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
    };
};

initFilters();

const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-GB');
};

const clearFilter = () => {
    initFilters();
};

const resetForm = () => {
    customerStore.formData = { customer_type: 'regular', customer_name: '', phone_number: '', address: '' };
    submitted.value = false;
};

const openNew = () => {
    formDialog.value = true;
    resetForm();
};

const edit = (customerData) => {
  customerStore.formData = { ...customerData };
  submitted.value = false;
  formDialog.value = true;
};

const hideDialog = () => {
  formDialog.value = false;
  resetForm();
};

const save = async () => {
  submitted.value = true;
  
  // Check for required fields
  if (!customerStore.formData.customer_name || !customerStore.formData.customer_type) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Harap isi semua kolom yang wajib diisi.', life: 3000 });
    return;
  }

  isSaving.value = true; 
  try {
      if (customerStore.formData.id) {
        await customerStore.updateCustomer(customerStore.formData);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Customer updated successfully', life: 3000 });
      } else {
        await customerStore.createCustomer(customerStore.formData);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Customer created successfully', life: 3000 });
      }
      hideDialog();
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save customer', life: 3000 });
    } finally {
      isSaving.value = false;
    }
};

const confirmDelete = (customer) => {
  customerStore.formData = customer;
  deleteDialog.value = true;
};

const deleteCustomer = async (id) => {
    isDeleting.value = true; 
    try {
      await customerStore.deleteCustomer(id);
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Customer Deleted', life: 3000 });
      hideDialog(); // Reset the delete dialog
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete customer', life: 3000 });
    } finally {
      deleteDialog.value = false;
      isDeleting.value = false;
    }
};

const exportCSV = () => {
  dt.value.exportCSV();
};

</script>
<template>
  <div class="card">
    <h1 class="text-2xl font-bold mb-4">Manajemen Pelanggan</h1>
    <Toolbar class="mb-6">
      <template #start>
        <Button label="Tambah" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
      </template>
      <template #end>
        <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
      </template>
    </Toolbar>
    <DataTable v-model:filters="filters" :value="customerStore.customers" paginator showGridlines :rows="10" dataKey="id"
               filterDisplay="menu" :globalFilterFields="['customer_name']">
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
          <span>No Customers found.</span>
        </div>
      </template>  
      <Column field="customer_name" header="Nama" style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.customer_name }}
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by Nama Pelanggan" />
        </template>
      </Column>
      <Column field="customer_type" header="Tipe Pelanggan" style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.customer_type }}
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by Tipe Pelanggan" />
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
      <Column :exportable="false" header="Aksi" alignFrozen="right" frozen style="min-width: 12rem">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="edit(slotProps.data)" />
          <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDelete(slotProps.data)" />
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="formDialog" :style="{ width: '450px' }" header="Detail Pelanggan" :modal="true">
      <div class="flex flex-col gap-6">
        <div>
          <label for="customer_type" class="block font-bold mb-3">Tipe Pelanggan</label>          
          <Dropdown
            v-model="customerStore.formData.customer_type"
            :options="customerTypes"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih Tipe Pelanggan"
            class="w-full"
          />
        </div>
        <div>
          <label for="customer_name" class="block font-bold mb-3">Nama Pelanggan</label>
          <InputText id="customer_name" v-model="customerStore.formData.customer_name" required fluid />
          <small v-if="submitted && !customerStore.formData.customer_name" class="text-red-500">Nama Pelanggan wajib diisi.</small>
        </div>
        <div>
          <label for="phone_number" class="block font-bold mb-3">Nomor HP</label>
          <InputText id="phone_number" v-model="customerStore.formData.phone_number" fluid />
        </div>
        <div>
          <label for="address" class="block font-bold mb-3">Alamat</label>
          <InputText id="address" v-model="customerStore.formData.address" fluid />
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
        <span v-if="customerStore.formData">Apakah anda yakin ingin menghapus <b>{{ customerStore.formData.customer_name }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteDialog = false" />
        <Button label="Yes" icon="pi pi-check" @click="deleteCustomer(customerStore.formData.id)" :disabled="isDeleting"/>
      </template>
    </Dialog>
  </div>
</template>
