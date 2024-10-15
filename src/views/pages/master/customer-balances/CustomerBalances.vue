<template>
    <div class="card">
        <h1 class="text-2xl font-bold mb-4">Saldo Pelanggan</h1>
        <Toolbar class="mb-6">
            <template #start>
                <Button label="Tambah" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
            </template>
            <template #end>
                <Button label="Export" icon="pi pi-upload" severity="help" />
            </template>
        </Toolbar>
        <DataTable v-model:filters="filters" scrollable :value="customerBalanceStore.balances" paginator showGridlines :rows="10" dataKey="id"
        filterDisplay="menu" :globalFilterFields="['customer.customer_name']">
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
            <Column field="customer.customer_name" header="Nama" style="min-width: 12rem">
                <template #body="{ data }">
                {{ data.customer.customer_name }}
                </template>
                <template #filter="{ filterModel }">
                <InputText v-model="filterModel.value" type="text" placeholder="Search by customer name" />
                </template>
            </Column>
            <Column field="balance_amount" header="Jumlah Saldo" style="min-width: 12rem" />
            <Column :exportable="false" header="Tindakan" alignFrozen="right" frozen style="min-width: 12rem">
                <template #body="slotProps">
                <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="edit(slotProps.data)" />
                <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDelete(slotProps.data)" />
                </template>
            </Column>
        </DataTable>
    </div>
    <Dialog v-model:visible="formDialog" :style="{ width: '450px' }" header="Deposit Details" :modal="true">
        <div class="flex flex-col gap-6">
            <div>
                <label for="customer_id" class="block font-bold mb-3">Pelanggan</label>
                <Dropdown
                v-model="formData.customer_id"
                :options="customerStore.regularCustomers"
                optionLabel="customer_name" 
                optionValue="id"
                placeholder="Select a Customer"
                class="w-full"
                />
                <small v-if="submitted && !formData.customer_id" class="text-red-500">Pelanggan wajib diisi.</small>
            </div>      
            <div>
                <label for="deposit_date" class="block font-bold mb-3">Tanggal Deposit</label>            
                <DatePicker v-model="formData.deposit_date" showIcon="true" showButtonBar="true" dateFormat="dd/mm/yy" fluid/>
            </div>
            <div>
                <label for="deposit_amount" class="block font-bold mb-3">Jumlah Deposit</label>
                <InputNumber v-model="formData.deposit_amount" inputId="currency-us" mode="currency" currency="IDR" locale="id-ID" fluid />
            </div>
        </div>
        <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Save" icon="pi pi-check" @click="save" :disabled="isSaving" />
        </template>
    </Dialog>
</template>

<script setup>
import { useCustomerStore } from '@/stores/customer';
import { useCustomerBalanceStore } from '@/stores/customerBalance';
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
const customerBalanceStore = useCustomerBalanceStore();
const customerStore = useCustomerStore();
const formData = ref({
    id: null,
    customer_id: null,
    deposit_amount: null,
    deposit_date: null,
});

onMounted(() => {
    customerStore.fetchRegularCustomers();
    customerBalanceStore.fetchBalances();
});


const initFilters = () => {
  filters.value = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      'customer.customer_name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
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
  formData.value = { customer_id: null, is_unlimited: false, deposit_amount: null, };
  submitted.value = false;
  isEditMode.value = false;
};

const openNew = () => {
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
//   toast.add({ severity: 'error', summary: 'Error', detail: 'Please fill in all required fields.', life: 3000 });
//   return;
// }

isSaving.value = true; 
try {
    if (isEditMode.value) {
      console.log(formData.value)
      await customerBalanceStore.updateBalance(formData.value);
      toast.add({ severity: 'success', summary: 'Success', detail: 'Saldo Pelanggan berhasil diperbarui', life: 3000 });
    } else {
      await customerBalanceStore.createBalance(formData.value);
      toast.add({ severity: 'success', summary: 'Success', detail: 'Saldo Pelanggan berhasil dibuat', life: 3000 });
    }
    customerBalanceStore.fetchBalances();
    hideDialog();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save customer', life: 3000 });
  } finally {
    isSaving.value = false; // Set to false after the process is complete
  }
};

</script>