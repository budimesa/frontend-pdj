<template>
  <div class="card grid grid-cols-1 md:grid-cols-12 gap-6">
      <div class="col-span-1 md:col-span-4">
          <label for="shipment_date" class="block font-bold mb-3">Shipment Date</label>            
          <DatePicker v-model="shipment_date" showIcon="true" showButtonBar="true" dateFormat="dd/mm/yy" fluid/>
      </div>
      <div class="col-span-1 md:col-span-4">
          <label for="received_date" class="block font-bold mb-3">Received Date</label>
          <DatePicker v-model="received_date" showIcon="true" showButtonBar="true" dateFormat="dd/mm/yy" fluid/>
      </div>
      <div class="col-span-1 md:col-span-4">
          <label for="supplier" class="block font-bold mb-3">Supplier</label>            
          <Dropdown 
            v-model="selectedOption" 
            :options="supplierOptions" 
            optionLabel="label" 
            :placeholder="selectedOption ? selectedOption.label : 'Select supplier'"
            filter 
            showClear 
            fluid
            />
      </div>
      <div class="col-span-1 md:col-span-12">
        <label for="product" class="block font-bold mb-3">Product</label> 
        <Dropdown 
          v-model="selectedProduct" 
          :options="filteredProducts" 
          optionLabel="concat_code_name" 
          @change="addProduct"
          filter 
          filterBy="concat_code_name" 
          placeholder="Select a Product" 
          class="w-full"
          fluid
        />
      </div>
      <div class="col-span-1 md:col-span-12">
        <DataTable :value="products" editMode="cell" @cell-edit-complete="onCellEditComplete" scrollable>
          <Column  v-for="col in columns" :key="col.field" :field="col.field" :header="col.header"
                :class="[{ 'hidden': col.field === 'item_id' }]">
              <template #body="{ data, field }">
                  <span v-if="field !== 'code'">{{ field === 'total_price' ? formatIDR(data[field]) : data[field] }}</span>
                  <input v-if="field === 'code'" type="hidden" v-model="data[field]" />
              </template>
              <template #editor="{ data, field }">
                  <template v-if="field === 'item_id'">
                      <input type="hidden" v-model="data[field]" />
                  </template>
                  <template v-else-if="field === 'quantity'">
                      <InputNumber 
                          v-model="data[field]" 
                          inputId="horizontal-buttons" 
                          showButtons 
                          buttonLayout="horizontal" 
                          :step="1" 
                      >
                          <template #incrementicon>
                              <span class="pi pi-plus" />
                          </template>
                          <template #decrementicon>
                              <span class="pi pi-minus" />
                          </template>
                      </InputNumber>
                  </template>
                  <template v-else-if="field === 'name'">
                      <span>{{ data[field] }}</span>
                  </template>
                  <template v-else-if="field === 'unit_price'">
                      <InputNumber v-model="data[field]" mode="currency" currency="IDR"
                        locale="id-ID"
                        :formatter="formatIDR" autofocus fluid />
                  </template>
                  <template v-else-if="field === 'total_price'">
                      <InputNumber v-model="data[field]" mode="currency" currency="IDR"
                        locale="id-ID"
                        :formatter="formatIDR" autofocus fluid />
                  </template>
                  <template v-else-if="field === 'labor_cost'">
                      <InputNumber v-model="data[field]" mode="currency" currency="IDR"
                        locale="id-ID"
                        :formatter="formatIDR" autofocus fluid />
                  </template>                  
                  <template v-else>
                      <InputText v-model="data[field]" autofocus fluid />
                  </template>
              </template>
          </Column>
          <Column header="Actions" alignFrozen="right" frozen>
              <template #body="{ data }">
                <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteRow(data)" />
              </template>
          </Column>
        </DataTable>

      </div>

      <!-- Uncomment these sections as needed -->
      <div class="col-span-1 md:col-span-4">
          <label for="shipment_cost" class="block font-bold mb-3">Shipping Cost</label>
          <InputNumber id="shipment_cost" v-model="shipment_cost" mode="currency" currency="IDR"
            locale="id-ID"
            :formatter="formatIDR" fluid />
      </div>
      <div class="col-span-1 md:col-span-4">
          <label for="other_fee" class="block font-bold mb-3">Other Fee</label>
          <InputNumber id="other_fee" v-model="other_fee" mode="currency" currency="IDR"
            locale="id-ID"
            :formatter="formatIDR" fluid />
      </div>
      <div class="col-span-1 md:col-span-4">
          <label for="notes" class="block font-bold mb-3">Notes</label>
          <InputText type="text" v-model="notes" fluid/>
      </div>
  </div>
</template>


<script setup>
import { useBatchStore } from '@/stores/batch';
import { useItemStore } from '@/stores/item';
import { useSupplierStore } from '@/stores/supplier';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const options = ref([]);
const shipment_date = ref();
const received_date = ref();
const shipment_cost = ref();
const other_fee = ref();
const notes = ref();

const formatIDR = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(value);
};


const getColumnClasses = (field) => {
  const classes = {
    item_id: 'hidden',
    // quantity: 'w-1/6', // 16.67%
    // name: 'w-1/3',     // 33.33%
    // unit_price: 'w-1/6',
    // total_price: 'w-1/6',
    // labor_cost: 'w-1/6'
  };
  return classes[field] || 'w-auto'; // Default ke 'auto' jika field tidak ditemukan
};

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
const batchStore = useBatchStore();
const items = ref();
const selectedProduct = ref(null);
const filteredProducts = ref([]);

const search = (event) => {
    const query = event.target.value.toLowerCase();
    filteredProducts.value = items.value.filter(item => item.item_name.toLowerCase().includes(query));
};

const addProduct = () => {
    if (selectedProduct.value) {
        const newProduct = {
            item_id : selectedProduct.value.id,
            name: selectedProduct.value.concat_code_name,
            code: selectedProduct.value.code,
            quantity: 20, // Default value if needed
            unit_price: 10, // Default price if needed
        };
        products.value.push(newProduct);
        selectedProduct.value = null; // Reset after adding
    }
};

// Function to delete a row
const deleteRow = (data) => {
  // Remove the row from the products array
  products.value = products.value.filter(product => product !== data);
};

const products = ref([
    { 
        item_id: 'I001', 
        // batch_id: 'KPK24I0001', 
        name: 'Item A', 
        gross_weight: 15.5, 
        net_weight: 14.0, 
        unit_price: 50.00, 
        quantity: 20, 
        total_price: 1000.00, 
        labor_cost: 100.00, 
        notes: 'First batch of Item A' 
    }
]);

const columns = ref([
    { field: 'item_id', header: 'Item ID' },
    // { field: 'batch_id', header: 'Batch ID' },
    { field: 'name', header: 'Item' },
    { field: 'gross_weight', header: 'Bruto' },
    { field: 'net_weight', header: 'Neto' },
    { field: 'unit_price', header: 'Unit Price' },
    { field: 'quantity', header: 'Quantity' },
    { field: 'total_price', header: 'Total Price' },
    { field: 'labor_cost', header: 'Labor Cost' },
    { field: 'notes', header: 'Notes' },
]);

const onCellEditComplete = (event) => {
    let { data, newValue, field } = event;

    switch (field) {
        case 'quantity':
        case 'unit_price':
        case 'total_price':
        case 'labor_cost':
            if (isPositiveInteger(newValue)) {
                data[field] = newValue;
            } else {
                event.preventDefault();
            }
            break;

        default:
            if (typeof newValue === 'string' && newValue.trim().length > 0) {
                data[field] = newValue;
            } else {
                event.preventDefault();
            }
            break;
    }
};

const isPositiveInteger = (val) => {
    let str = String(val).trim();
    if (!str) return false;
    str = str.replace(/^0+/, '') || '0';
    const n = Math.floor(Number(str));
    return n !== Infinity && String(n) === str && n >= 0;
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const fetchItems = async () => {
    const fetchedItems = await itemStore.fetchItems();
    items.value = fetchedItems; // Mengupdate items dengan data yang diambil
    items.value = fetchedItems.map(item => ({
        ...item,
        concat_code_name: `${item.item_code}-${item.item_name}`
    }));
    filteredProducts.value = [...items.value];
};

const fetchNonRegularBatch = async () => {
    await batchStore.fetchNonRegularBatch();
}

onMounted(() => {
    fetchNonRegularBatch();
    fetchItems();
});

const formData = ref({ item_code: '', item_name: '',  item_description: '' });

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
    const response = await supplierStore.fetchSuppliers();
    supplierOptions.value = response.map(supplier => ({
      label: supplier.supplier_name,
      value: supplier.id
    }));
}

fetchSuppliers();

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

