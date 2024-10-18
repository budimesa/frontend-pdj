<template>
  <div class="card">
    <h1 class="text-2xl font-bold mb-4">Limit Kredit Pelanggan</h1>
    <Toolbar class="mb-6">
      <template #start>
        <Button label="Tambah" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
      </template>
      <template #end>
        <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
      </template>
    </Toolbar>
    <DataTable v-model:filters="filters" :value="customerLimitStore.creditLimits" paginator showGridlines :rows="10" dataKey="id"
             filterDisplay="menu" :globalFilterFields="['customer.customer_name']">
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
              <span>No Customers found.</span>
          </div>
      </template>  
      <Column field="customer.customer_name" header="Nama" style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.customer.customer_name }}
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan nama pelanggan" />
        </template>
      </Column>
      <Column field="limit_amount" header="Jumlah Limit" style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.limit_amount ? $formatIDR(data.limit_amount) : 'Unlimited' }}
        </template>
      </Column>
      <Column field="limit_used" header="Limit Terpakai" style="min-width: 12rem">
        <template #body="{ data }">
          {{ $formatIDR(data.limit_used) }}
        </template>
      </Column>
      <Column field="limit_remaining" header="Sisa Limit" style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.limit_remaining ? $formatIDR(data.limit_remaining) : 'Unlimited' }}
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

  <Dialog v-model:visible="formDialog" :style="{ width: '450px' }" header="Detail Limit Pelanggan" :modal="true">
    <div class="flex flex-col gap-6">
      <div>
        <label for="customer_id" class="block font-bold mb-3">Pelanggan</label>
        <Dropdown
          v-model="formData.customer_id"
          :options="customerStore.regularCustomers"
          optionLabel="customer_name" 
          optionValue="id"
          placeholder="Pilih pelanggan"
          class="w-full"
        />
        <small v-if="submitted && !formData.customer_id" class="text-red-500">Pelanggan Wajib Diisi.</small>
      </div>      
      <div>
        <label for="limit_amount" class="block font-bold mb-3">Jumlah Limit</label>
        <InputNumber v-model="formData.limit_amount" inputId="currency-us" mode="currency" currency="IDR" locale="id-ID" :disabled="isDisabled" fluid />
      </div>
      <div class="flex items-center">
        <Checkbox inputId="is_unlimited" v-model="formData.is_unlimited" binary  @click="toggleDisabled"/>
        <label for="is_unlimited" class="ml-2"> Limit Tanpa Batas?</label>
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
      <span v-if="formData">Apakah anda yakin ingin menghapus <b>{{ formData.customer_name }}</b>?</span>
    </div>
    <template #footer>
      <Button label="No" icon="pi pi-times" text @click="deleteDialog = false" />
      <Button label="Yes" icon="pi pi-check" @click="deleteCustomer(formData.id)" :disabled="isDeleting"/>
    </template>
  </Dialog>
</template>

<script setup>
import { useCustomerStore } from '@/stores/customer';
import { useCustomerCreditLimitStore } from '@/stores/customerCreditLimit';
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
const customerLimitStore = useCustomerCreditLimitStore();
const customerStore = useCustomerStore();

const formData = ref({
  customer_id: null,
  is_unlimited: false,
  limit_amount: null,
});

const isDisabled = ref(false);
const toggleDisabled = () => {
  formData.value.limit_amount = null;
  isDisabled.value = !isDisabled.value;
};

onMounted(() => {
  fetchRegularCustomers();
  fetchCreditLimits();
});

const fetchCreditLimits = async () => {
  await customerLimitStore.fetchCreditLimits();
};

const fetchRegularCustomers = async () => {
    await customerStore.fetchRegularCustomers();
};

const initFilters = () => {
  filters.value = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      'customer.customer_name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
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
  formData.value = { customer_id: null, is_unlimited: false, limit_amount: null, };
  submitted.value = false;
  isEditMode.value = false;
};

const openNew = () => {
  isDisabled.value = false;
  formDialog.value = true;
  resetForm();
};

const edit = (customerLimitData) => {
formData.value = { ...customerLimitData };
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
// if (!formData.value.customer_name || !formData.value.customer_type) {
//   toast.add({ severity: 'error', summary: 'Error', detail: 'Harap isi semua kolom yang wajib diisi.', life: 3000 });
//   return;
// }

isSaving.value = true; 
try {
    if (isEditMode.value) {
      console.log(formData.value)
      await customerLimitStore.updateCreditLimit(formData.value);
      toast.add({ severity: 'success', summary: 'Success', detail: 'Limit kredit berhasil diperbarui', life: 3000 });
    } else {
      await customerLimitStore.createCreditLimit(formData.value);
      toast.add({ severity: 'success', summary: 'Success', detail: 'Limit kredit berhasil dibuat', life: 3000 });
    }
    fetchCreditLimits();
    hideDialog();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save customer', life: 3000 });
  } finally {
    isSaving.value = false; // Set to false after the process is complete
  }
};


const confirmDelete = (customer) => {
formData.value = customer;
deleteDialog.value = true;
};

const deleteCustomer = async (id) => {
 isDeleting.value = true; // Set loading state before deletion
  try {
      await customerLimitStore.deleteCustomer(id);
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Customer Deleted', life: 3000 });
      fetchCreditLimits();
  } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete customer', life: 3000 });
  } finally {
      deleteDialog.value = false;
      isDeleting.value = false; // Reset loading state after the process
  }
};

const exportCSV = () => {
dt.value.exportCSV();
};

</script>

