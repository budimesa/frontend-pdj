<template>
    <div class="card flex space-x-2">
    <div class="w-full md:w-1/3 p-4">
        <DatePicker v-model="selectedDate" showIcon="true" showButtonBar="true"/>
    </div>
    <div class="w-full md:w-1/3 p-4">
        <!-- <multiselect
            class="custom-multiselect border border-surface-300 dark:border-surface-700 rounded-md bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-200"
            v-model="selectedSupplier2"
            :options="supplierOptions"
            :searchable="true"
            :closeOnSelect="true"
            :clearOnSelect="true"
            placeholder=""
            label="label"
            track-by="id"
        /> -->
    
        <Dropdown 
        v-model="selectedOption" 
        :options="supplierOptions" 
        optionLabel="label" 
        :placeholder="selectedOption ? selectedOption.label : 'Select an option'"
        filter 
        showClear 
        />

        <Dropdown 
        v-model="selectedOption" 
        :options="options" 
        optionLabel="label" 
        :placeholder="selectedOption ? selectedOption.label : 'Select an option'"
        filter 
        showClear 
        />
    
    </div>
    <div class="w-full md:w-1/3 p-4">
        <InputText value="Toko (Gudang Sementara)" disabled/>
    </div>
</div>
  </template>

<script setup>
import { useItemStore } from '@/stores/item';
import { useSupplierStore } from '@/stores/supplier';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const options = ref([]);

const selectedOption = ref(null);

// Computed property untuk menampilkan label yang sesuai
const placeholder = computed(() => {
  return selectedOption.value ? selectedOption.value.label : 'Select an option';
});

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
const selectedSupplier = ref({label: '', code: ''});
const supplierOptions = ref([]);
const itemStore = useItemStore();

const formData = ref({ item_code: '', item_name: '',  item_description: '' });
// const fetchItems = async () => {
//     await itemStore.fetchItems();
// };

onMounted(() => {
    // fetchItems();
});

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        item_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        item_code: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        item_description: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        created_at: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
    };
};

initFilters();

const fetchSuppliers = async () => {
    // try {
    //   const response = await supplierStore.fetchSuppliers();
    //   supplierOptions.value = response.map(supplier => ({
    //   label: supplier.supplier_name,  // Ganti dengan property yang sesuai
    //   value: supplier.id     // Ganti dengan property yang sesuai
    // }));
      
    // } catch (error) {
    //   console.error('Failed to fetch inventory types:', error);
    // }
}

fetchSuppliers();

const fetchItems = async () => {
    try {
      const response = await itemStore.fetchItems();
      console.log(response)
      itemOptions.value = response.map(item => ({
        label: item.item_name,  // Ganti dengan property yang sesuai
        value: item.id     // Ganti dengan property yang sesuai
    }));
      
    } catch (error) {
      console.error('Failed to fetch inventory types:', error);
    }
}

fetchItems();


// await fetchSuppliers();
//   if (item.value.supplier_id === '' || item.value.supplier_id === null) {
//     selectedSupplier.value = { label: '', id: '' };
//   } else {
//     const selectedOption = supplierOptions.value.find(option => option.id === item.value.supplier_id);
//     if (selectedOption) {
//       selectedSupplier.value = selectedOption;
//     }
//   }

const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB');
};

const clearFilter = () => {
    initFilters();
};

const resetForm = () => {
    formData.value = { item_code: '', item_name: '', item_description: '' };
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
//   if (!formData.value.item_name || !formData.value.item_code) {
//     toast.add({ severity: 'error', summary: 'Error', detail: 'Please fill in all required fields.', life: 3000 });
//     return;
//   }
//   isSaving.value = true; 
//   try {
//       if (isEditMode.value) {
//         await itemStore.updateItem(formData.value);
//         toast.add({ severity: 'success', summary: 'Success', detail: 'Item updated successfully', life: 3000 });
//       } else {
//         console.log(formData.value)
//         await itemStore.createItem(formData.value);
//         toast.add({ severity: 'success', summary: 'Success', detail: 'Item created successfully', life: 3000 });
//       }
//       fetchItems();
//       hideDialog();
//     } catch (error) {
//       toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save item', life: 3000 });
//     } finally {
//       isSaving.value = false; // Set to false after the process is complete
//     }
};


const confirmDelete = (item) => {
  formData.value = item;
  deleteDialog.value = true;
};

const deleteItem = async (id) => {
//    isDeleting.value = true; // Set loading state before deletion
//     try {
//         await itemStore.deleteItem(id);
//         toast.add({ severity: 'success', summary: 'Successful', detail: 'Item Deleted', life: 3000 });
//         fetchItems();
//     } catch (error) {
//         toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete item', life: 3000 });
//     } finally {
//         deleteDialog.value = false;
//         isDeleting.value = false; // Reset loading state after the process
//     }
};

const exportCSV = () => {
  dt.value.exportCSV();
};

</script>

