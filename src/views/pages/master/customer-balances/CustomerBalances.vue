<template>
    <div class="card">
        <h1 class="text-2xl font-bold mb-4">Saldo Pelanggan</h1>
        <Toolbar class="mb-6">
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
                <InputText v-model="filters['global'].value" placeholder="Masukkan Kata Kunci" fluid />
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
                <InputText v-model="filterModel.value" type="text" placeholder="Cari berdasarkan Nama Pelanggan" />
                </template>
            </Column>
            <Column field="balance_amount" header="Jumlah Saldo" style="min-width: 12rem">
                <template #body="{ data }">
                {{ $formatIDR(data.balance_amount) }} 
                </template>
            </Column>
            <Column :exportable="false" header="Aksi" alignFrozen="right" frozen style="min-width: 12rem">
                <template #body="slotProps">
                <Button icon="pi pi-search" outlined rounded class="mr-2" @click="edit(slotProps.data)" />
                </template>
            </Column>
        </DataTable>
    </div>
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
//   toast.add({ severity: 'error', summary: 'Error', detail: 'Harap isi semua kolom yang wajib diisi.', life: 3000 });
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
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal menyimpan saldo pelanggan', life: 3000 });
  } finally {
    isSaving.value = false; // Set to false after the process is complete
  }
};

</script>