<template>
  <div class="card">
    <h1 class="text-2xl font-bold mb-4">Customer Credit Limit Management</h1>
    <Toolbar class="mb-6">
      <template #start>
        <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
      </template>
      <template #end>
        <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
      </template>
    </Toolbar>
    <DataTable v-model:filters="filters" :value="customerCreditLimitStore.creditLimits" paginator showGridlines :rows="10" dataKey="id"
               filterDisplay="menu" :globalFilterFields="['customer_name', 'limit_amount', 'limit_used']">
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
              <span>No Customer Credit Limits found.</span>
          </div>
      </template>  
      <Column field="customer_name" header="Customer" style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.customer.customer_name }}
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by Customer Name" />
        </template>
      </Column>

      <Column field="limit_amount" header="Limit Amount" style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.limit_amount }}
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by Limit Amount" />
        </template>
      </Column>

      <Column field="limit_used" header="Limit Used" style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.limit_used }}
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by Limit Used" />
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

      <Column header="Updated At" field="updated_at" style="min-width: 12rem">
        <template #body="{ data }">
          {{ formatDate(data.updated_at) }}
        </template>
        <template #filter="{ filterModel }">
          <DatePicker v-model="filterModel.value" dateFormat="dd/mm/yy" placeholder="dd/mm/yyyy" />
        </template>
      </Column>

      <Column :exportable="false" header="Actions" alignFrozen="right" frozen>
        <template #body="slotProps">
          <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="edit(slotProps.data)" />
          <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDelete(slotProps.data)" />
        </template>
      </Column>
    </DataTable>
  </div>

  <Dialog v-model:visible="formDialog" :style="{ width: '450px' }" header="Customer Credit Limit" :modal="true">
    <div class="flex flex-col gap-6">
      <div>
        <label for="customer" class="block font-bold mb-3">Select Customer</label>
        <Dropdown
          v-model="formData.customer_id"
          :options="filteredCustomers"
          optionLabel="customer_name"
          optionValue="id"
          placeholder="Select a Customer"
          class="w-full"
          :disabled="isSaving"
        />
      </div>
      
      <div>
        <label for="limit_amount" class="block font-bold mb-3">Limit Amount</label>
        <InputText 
          id="limit_amount" 
          v-model="formData.limit_amount" 
          :disabled="formData.is_unlimited" 
          required 
          fluid 
        />
      </div>

      <div class="flex gap-4">
        <div>
          <label class="block font-bold mb-2">Unlimited Limit?</label>
          <RadioButton 
            v-model="formData.is_unlimited" 
            :value="true" 
            name="limit_option" 
            inputId="is_unlimited_true"
          />
          <label for="is_unlimited_true">Yes</label>
        </div>
        <div>
          <RadioButton 
            v-model="formData.is_unlimited" 
            :value="false" 
            name="limit_option" 
            inputId="is_unlimited_false"
          />
          <label for="is_unlimited_false">No</label>
        </div>
      </div>
      
      <small v-if="submitted && !formData.customer_id" class="text-red-500">Customer is required.</small>
      <small v-if="submitted && !formData.limit_amount && !formData.is_unlimited" class="text-red-500">Limit Amount is required unless Unlimited is selected.</small>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
      <Button label="Save" icon="pi pi-check" @click="save" :disabled="isSaving" />
    </template>
  </Dialog>

  <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
    <div class="flex items-center gap-4">
      <i class="pi pi-exclamation-triangle !text-3xl" />
      <span v-if="formData">Are you sure you want to delete the credit limit for <b>{{ formData.customer.customer_name }}</b>?</span>
    </div>
    <template #footer>
      <Button label="No" icon="pi pi-times" text @click="deleteDialog = false" />
      <Button label="Yes" icon="pi pi-check" @click="deleteCreditLimit(formData.id)" :disabled="isDeleting"/>
    </template>
  </Dialog>
</template>

<script setup>
import { useCustomerCreditLimitStore } from '@/stores/customerCreditLimit'; // Ganti dengan store yang sesuai
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
const customerCreditLimitStore = useCustomerCreditLimitStore();
const formData = ref({ customer_id: '', limit_amount: '', is_unlimited: false });
const filteredCustomers = ref([]);

const fetchCreditLimits = async () => {
  await customerCreditLimitStore.fetchCreditLimits();
};

const fetchCustomers = async () => {
  // Fetch customers from your customer store
  await customerStore.fetchCustomers();
  filteredCustomers.value = customerStore.customers; // Assuming you have access to customerStore
};

onMounted(() => {
  fetchCreditLimits();
  fetchCustomers();
});

const initFilters = () => {
  filters.value = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      customer_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
      limit_amount: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
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
  formData.value = { customer_id: '', limit_amount: '', is_unlimited: false };
  submitted.value = false;
  isEditMode.value = false;
};

const openNew = () => {
  formDialog.value = true;
  resetForm();
};

const edit = (creditLimitData) => {
  formData.value = { ...creditLimitData };
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
  if (!formData.value.customer_id || (!formData.value.limit_amount && !formData.value.is_unlimited)) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Please fill in all required fields.', life: 3000 });
      return;
  }

  isSaving.value = true; 
  try {
      if (isEditMode.value) {
          await customerCreditLimitStore.updateCreditLimit(formData.value);
          toast.add({ severity: 'success', summary: 'Success', detail: 'Credit limit updated successfully', life: 3000 });
      } else {
          await customerCreditLimitStore.createCreditLimit(formData.value);
          toast.add({ severity: 'success', summary: 'Success', detail: 'Credit limit created successfully', life: 3000 });
      }
      fetchCreditLimits();
      hideDialog();
  } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save credit limit', life: 3000 });
  } finally {
      isSaving.value = false;
  }
};

const confirmDelete = (creditLimit) => {
  formData.value = creditLimit;
  deleteDialog.value = true;
};

const deleteCreditLimit = async (id) => {
  isDeleting.value = true;
  try {
      await customerCreditLimitStore.deleteCreditLimit(id);
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Credit limit deleted', life: 3000 });
      fetchCreditLimits();
  } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete credit limit', life: 3000 });
  } finally {
      deleteDialog.value = false;
      isDeleting.value = false;
  }
};

const exportCSV = () => {
  dt.value.exportCSV();
};
</script>
