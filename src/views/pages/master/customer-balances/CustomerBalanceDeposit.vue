<template>
    <div class="card">
        <h1 class="text-2xl font-bold mb-4">Customer Balance Deposit</h1>
        <Toolbar class="mb-6">
            <template #start>
                <Button label="Tambah" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
            </template>
            <template #end>
                <Button label="Export" icon="pi pi-upload" severity="help" />
            </template>
        </Toolbar>
        <DataTable v-model:filters="filters" scrollable :value="customerBalanceDepositStore.customerBalances" paginator showGridlines :rows="10" dataKey="id"
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
                    <span>No Customers found.</span>
                </div>
            </template>  
            <Column field="customer.customer_name" header="Name" style="min-width: 12rem">
                <template #body="{ data }">
                {{ data.customer.customer_name }}
                </template>
                <template #filter="{ filterModel }">
                <InputText v-model="filterModel.value" type="text" placeholder="Search by customer name" />
                </template>
            </Column>
            <Column field="deposit_amount" header="Deposit Amount" style="min-width: 12rem" />
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

            <Column :exportable="false" header="Aksi" alignFrozen="right" frozen>
                <template #body="slotProps">
                <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="edit(slotProps.data)" />
                <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDelete(slotProps.data)" />
                </template>
            </Column>
        </DataTable>
    </div>
    <Dialog v-model:visible="formDialog" :style="{ width: '450px' }" header="Customer Details" :modal="true">
        <div class="flex flex-col gap-6">
            <div>
                <label for="customer_id" class="block font-bold mb-3">Customer</label>
                <Dropdown
                v-model="formData.customer_id"
                :options="customerStore.regularCustomers"
                optionLabel="customer_name" 
                optionValue="id"
                placeholder="Pilih pelanggan"
                class="w-full"
                />
                <small v-if="submitted && !formData.customer_id" class="text-red-500">Customer wajib diisi.</small>
            </div>      
            <div>
                <label for="limit_amount" class="block font-bold mb-3">Deposit Amount</label>
                <InputNumber v-model="formData.limit_amount" inputId="currency-us" mode="currency" currency="IDR" locale="id-ID" :disabled="isDisabled" fluid />
            </div>
            <div class="flex items-center">
                <label for="deposit_date" class="block font-bold mb-3">Deposit Date</label>            
            <DatePicker v-model="formData.deposit_date" showIcon="true" showButtonBar="true" dateFormat="dd/mm/yy" fluid/>
            </div>
        </div>
        <template #footer>
        <Button label="Batal" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Simpan" icon="pi pi-check" @click="save" :disabled="isSaving" />
        </template>
    </Dialog>
</template>

<script setup>
import { useCustomerStore } from '@/stores/customer';
import { useCustomerBalanceDepositStore } from '@/stores/customerBalanceDeposit';
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
const customerBalanceDepositStore = useCustomerBalanceDepositStore();
const customerStore = useCustomerStore();
const formData = ref({
    id: null,
    customer_id: null,
    limit_amount: null,
    deposit_date: null,
});

onMounted(() => {
    // customerBalanceDepositStore.fetchBalanceDeposits();
    customerStore.fetchRegularCustomers();
});


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

</script>