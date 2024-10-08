<template>
  <div class="card">
    <h1 class="text-2xl font-bold mb-4">Customer Management</h1>
    <Toolbar class="mb-6">
      <template #start>
        <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
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
            <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
          </IconField>
        </div>
      </template>        
      <template #empty>
          <div class="flex items-center justify-center h-full">
              <span>No Customers found.</span>
          </div>
      </template>  
      <Column field="customer_name" header="Name" style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.customer_name }}
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by customer name" />
        </template>
      </Column>

      <Column field="customer_type" header="Customer Type" style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.customer_type }}
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by customer type" />
        </template>
      </Column>

      <Column field="phone_number" header="Phone Number" style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.phone_number }}
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" type="text" placeholder="Search by phone number" />
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

  <Dialog v-model:visible="formDialog" :style="{ width: '450px' }" header="Customer Details" :modal="true">
    <div class="flex flex-col gap-6">
      <div>
        <label for="customer_type" class="block font-bold mb-3">Customer Type</label>          
          <Dropdown
          v-model="formData.customer_type"
          :options="customerTypes"
          optionLabel="label"
          optionValue="value"
          placeholder="Select a Customer Type"
          class="w-full"
          />
        <!-- <small v-if="submitted && !formData.customer_type" class="text-red-500">Customer Type is required.</small> -->
      </div>
      <div>
        <label for="customer_name" class="block font-bold mb-3">Customer Name</label>
        <InputText id="customer_name" v-model="formData.customer_name" required fluid />
        <small v-if="submitted && !formData.customer_name" class="text-red-500">Customer Name is required.</small>
      </div>
      <div>
        <label for="phone_number" class="block font-bold mb-3">Phone Number</label>
        <InputText id="phone_number" v-model="formData.phone_number" fluid />
      </div>
      <div>
        <label for="address" class="block font-bold mb-3">Address</label>
        <InputText id="address" v-model="formData.address" fluid />
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
      <Button label="Save" icon="pi pi-check" @click="save" :disabled="isSaving" />
    </template>
  </Dialog>

  <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
    <div class="flex items-center gap-4">
      <i class="pi pi-exclamation-triangle !text-3xl" />
      <span v-if="formData">Are you sure you want to delete <b>{{ formData.customer_name }}</b>?</span>
    </div>
    <template #footer>
      <Button label="No" icon="pi pi-times" text @click="deleteDialog = false" />
      <Button label="Yes" icon="pi pi-check" @click="deleteCustomer(formData.id)" :disabled="isDeleting"/>
    </template>
  </Dialog>
</template>

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
const isEditMode = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const customerStore = useCustomerStore();
const customerTypes = [
{ label: 'Regular', value: 'regular' },
{ label: 'Non-Regular', value: 'non-regular' },
];

const formData = ref({ customer_type: 'regular', customer_name: '', phone_number: '', address: '' });
const isNonRegular = ref(false);

const fetchCustomers = async () => {
  await customerStore.fetchCustomers();
};

onMounted(() => {
  fetchCustomers();
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
  const d = new Date(date);
  return d.toLocaleDateString('en-GB');
};

const clearFilter = () => {
  initFilters();
};

const resetForm = () => {
  formData.value = { customer_type: 'regular', customer_name: '', phone_number: '', address: '' };
  submitted.value = false;
  isEditMode.value = false;
};

const openNew = () => {
  formDialog.value = true;
  resetForm();
};

const edit = (customerData) => {
formData.value = { ...customerData };
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
if (!formData.value.customer_name || !formData.value.customer_type) {
  toast.add({ severity: 'error', summary: 'Error', detail: 'Please fill in all required fields.', life: 3000 });
  return;
}

isSaving.value = true; 
try {
    if (isEditMode.value) {
      await customerStore.updateCustomer(formData.value);
      toast.add({ severity: 'success', summary: 'Success', detail: 'Customer updated successfully', life: 3000 });
    } else {
      console.log(formData.value)
      await customerStore.createCustomer(formData.value);
      toast.add({ severity: 'success', summary: 'Success', detail: 'Customer created successfully', life: 3000 });
    }
    fetchCustomers();
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
      await customerStore.deleteCustomer(id);
      toast.add({ severity: 'success', summary: 'Successful', detail: 'Customer Deleted', life: 3000 });
      fetchCustomers();
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

