<template>
  <div class="card grid grid-cols-1 md:grid-cols-12 gap-6">
      <div class="col-span-1 md:col-span-3">
          <label for="incoming_item_code" class="block font-bold mb-3">Incoming Item Code</label>            
          <InputText type="text" v-model="incomingItemStore.newItemIncomingCode" fluid disabled/>
      </div>
      <div class="col-span-1 md:col-span-3">
          <label for="shipment_date" class="block font-bold mb-3">Shipment Date</label>            
          <DatePicker v-model="formData.shipment_date" showIcon="true" showButtonBar="true" dateFormat="dd/mm/yy" fluid/>
      </div>
      <div class="col-span-1 md:col-span-3">
          <label for="received_date" class="block font-bold mb-3">Received Date</label>
          <DatePicker v-model="formData.received_date" showIcon="true" showButtonBar="true" dateFormat="dd/mm/yy" fluid/>
      </div>
      <div class="col-span-1 md:col-span-3">
          <label for="supplier" class="block font-bold mb-3">Supplier</label>            
          <Dropdown 
            v-model="formData.supplier_id" 
            :options="supplierOptions" 
            optionLabel="label" 
            optionValue="value"
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
          <template #empty>
              <div class="flex items-center justify-center h-full">
                  <span>No Items found.</span>
              </div>
          </template>
          <Column  v-for="col in columns" :key="col.field" :field="col.field" :header="col.header"
                :class="[{ 'hidden': col.field === 'item_id' }]">                
              <template #body="{ data, field }">
                  <!-- <span v-if="field !== 'code'">{{ field === 'total_price' ? formatIDR(data[field]) : data[field] }}</span> -->
                  <span v-if="field !== 'code'">{{  data[field] }}</span>
                  <input v-if="field === 'code'" type="hidden" v-model="data[field]" />
              </template>
              <template #editor="{ data, field }">
                  <template v-if="field === 'item_id'">
                      <input type="hidden" v-model="data[field]" />
                  </template>
                  <template v-else-if="field === 'initial_stock'">
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
                    <span>{{ data[field] }}</span>
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
      <div class="col-span-1 md:col-span-12">
        <div class="flex justify-end">
            <table class="border border-gray-300 w-1/3">
                <thead>
                    <tr class="bg-gray-100 dark:bg-gray-700">
                        <th class="py-2 px-4 text-left">Description</th>
                        <th class="py-2 px-4 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>                  
                    <tr class="border-b hover:bg-gray-50">
                        <td class="py-2 px-4">Total Item Price:</td>
                        <td class="py-2 px-4 text-right">{{ formatIDR(totalItemPrice) }}</td>
                    </tr>
                    <tr class="border-b hover:bg-gray-50">
                        <td class="py-2 px-4">Labor Cost:</td>
                        <td class="py-2 px-4 text-right">{{ formatIDR(totalLaborCost) }}</td>
                    </tr>
                    <tr class="border-b hover:bg-gray-50">
                        <td class="py-2 px-4">Other Fee:</td>
                        <td class="py-2 px-4 text-right">{{ formatIDR(formData.other_fee) }}</td>
                    </tr>
                    <tr class="border-b hover:bg-gray-50">
                        <td class="py-2 px-4">Shipping:</td>
                        <td class="py-2 px-4 text-right">{{ formatIDR(formData.shipping_cost) }}</td>
                    </tr>
                    <tr class="font-bold">
                        <td class="py-2 px-4">Grand Total:</td>
                        <td class="py-2 px-4 text-right">{{ formatIDR(grandTotal) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>

      <!-- Uncomment these sections as needed -->
      <div class="col-span-1 md:col-span-4">
          <label for="shipping_cost" class="block font-bold mb-3">Shipping Cost</label>
          <InputNumber id="shipping_cost" v-model="formData.shipping_cost" mode="currency" currency="IDR"
            locale="id-ID"
            :formatter="formatIDR" fluid />
      </div>
      <div class="col-span-1 md:col-span-4">
          <label for="other_fee" class="block font-bold mb-3">Other Fee</label>
          <InputNumber id="other_fee" v-model="formData.other_fee" mode="currency" currency="IDR"
            locale="id-ID"
            :formatter="formatIDR" fluid />
      </div>
      <div class="col-span-1 md:col-span-4">
          <label for="notes" class="block font-bold mb-3">Notes</label>
          <InputText type="text" v-model="formData.notes" fluid/>
      </div>
      <div class="col-span-1 md:col-span-12 flex justify-end mt-4">
        <Button label="Cancel" icon="pi pi-times" text @click="cancelForm" />
        <Button label="Save" icon="pi pi-check" @click="save" :disabled="isSaving" class="ml-2" />
    </div>
  </div>
  
</template>


<script setup>
import { useIncomingItemStore } from '@/stores/incomingItem';
import { useItemStore } from '@/stores/item';
import { useSupplierStore } from '@/stores/supplier';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const formatIDR = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(value);
};

const selectedOption = ref(null);
const toast = useToast();
const dt = ref();
const router = useRouter();
const filters = ref({});
const submitted = ref(false);
const isSaving = ref(false);
const supplierStore = useSupplierStore();
const incomingItemStore = useIncomingItemStore();
const supplierOptions = ref([]);
const itemStore = useItemStore();
const items = ref();
const selectedProduct = ref(null);
const filteredProducts = ref([]);

// Computed property untuk total labor_cost
const totalLaborCost = computed(() => {
  return products.value.reduce((total, product) => {
    return total + (parseFloat(product.labor_cost * product.initial_stock) || 0);
  }, 0);
});

const totalItemPrice = computed(() => {
  return products.value.reduce((total, product) => {
    return total + (parseFloat(product.total_price) || 0);
  }, 0);
});

// Computed property untuk menghitung grand total
const grandTotal = computed(() => {
  return totalItemPrice.value + totalLaborCost.value + (parseFloat(formData.value.other_fee) || 0) + (parseFloat(formData.value.shipping_cost) || 0);
});

const formData = ref({ 
  incoming_item_code: incomingItemStore.newItemIncomingCode,
  supplier_id: '',  
  warehouse_id: '' ,
  shipment_date: '',
  received_date: '',
  total_item_price: '',
  shipping_cost: '',
  labor_cost: '',
  other_fee: '',
  total_cost: '',
  notes: '',

});

const addProduct = () => {
    if (selectedProduct.value) {
        const newProduct = {
            item_id : selectedProduct.value.id,
            name: selectedProduct.value.concat_code_name,
            code: selectedProduct.value.code,
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

const products = ref([]);

const columns = ref([
    { field: 'item_id', header: 'Item ID' },
    // { field: 'batch_id', header: 'Batch ID' },
    { field: 'name', header: 'Item' },
    { field: 'description', header: 'Description' },
    { field: 'gross_weight', header: 'Bruto' },
    { field: 'net_weight', header: 'Neto' },
    { field: 'labor_cost', header: 'Labor Cost' },
    { field: 'initial_stock', header: 'Quantity' },
    { field: 'unit_price', header: 'Unit Price' },
    { field: 'total_price', header: 'Total Price' },
    { field: 'notes', header: 'Notes' },
]);

const onCellEditComplete = (event) => {
    let { data, newValue, field } = event;

    switch (field) {
        case 'net_weight':
        case 'initial_stock':
        case 'unit_price':
            if (isPositiveInteger(newValue) || field === 'unit_price') {
                data[field] = newValue;

                // Hitung total_price otomatis
                const unitPrice = parseFloat(data.unit_price) || 0;
                const netWeight = parseFloat(data.net_weight) || 0;
                const initialStock = parseFloat(data.initial_stock) || 0;
                data.total_price = (unitPrice * initialStock * netWeight); // Menyimpan total_price sebagai string dengan 2 desimal
            } else {
                event.preventDefault();
            }
            break;

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
        concat_code_name: `${item.item_code} - ${item.item_name}`
    }));
    filteredProducts.value = [...items.value];
};

const generateNewIncomingItemCode = async () => {
    await incomingItemStore.generateNewIncomingItemCode();
}

onMounted(() => {
    generateNewIncomingItemCode();
    fetchItems();
    fetchSuppliers();
});

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        item_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        item_code: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        notes: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
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

const resetForm = () => {
    formData.value = { item_code: '', item_name: '', notes: '' };
    submitted.value = false;
};

const cancelForm = () => {
  router.push('/pages/incoming-items/');
  resetForm();
};

const save = async () => {
  submitted.value = true;
  isSaving.value = true; 
  try {
      formData.value.incoming_item_code = incomingItemStore.newItemIncomingCode;
      formData.value.labor_cost = totalLaborCost.value;
      formData.value.total_item_price = totalItemPrice.value;
      formData.value.total_cost = grandTotal.value;

      await incomingItemStore.createIncomingItem({
        ...formData.value,
        details: products.value
      });
        
      toast.add({ severity: 'success', summary: 'Success', detail: 'Incoming Item created successfully', life: 3000 });     
      router.push('/pages/incoming-items');
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save incoming items', life: 3000 });
    } finally {
      isSaving.value = false; // Set to false after the process is complete
    }
};

</script>

