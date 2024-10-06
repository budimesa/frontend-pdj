<template>
    <div class="card grid grid-cols-1 md:grid-cols-12 gap-6">
      <div class="col-span-1 md:col-span-3">
        <label for="incoming_item_code" class="block font-bold mb-3">Incoming Item Code</label>
        <InputText type="text" v-model="formData.incoming_item_code" fluid disabled />
      </div>
      <div class="col-span-1 md:col-span-3">
        <label for="shipment_date" class="block font-bold mb-3">Shipment Date</label>
        <DatePicker v-model="formData.shipment_date" showIcon="true" showButtonBar="true" dateFormat="dd/mm/yy" fluid />
      </div>
      <div class="col-span-1 md:col-span-3">
        <label for="received_date" class="block font-bold mb-3">Received Date</label>
        <DatePicker v-model="formData.received_date" showIcon="true" showButtonBar="true" dateFormat="dd/mm/yy" fluid />
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
              <span>No Incoming Items found.</span>
            </div>
          </template>
          <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" :class="[{ 'hidden': col.field === 'item_id' }]">
            <template #body="{ data, field }">
              <span v-if="field !== 'code'">{{ data[field] }}</span>
              <input v-if="field === 'code'" type="hidden" v-model="data[field]" />
            </template>
            <template #editor="{ data, field }">
              <template v-if="field === 'item_id'">
                <input type="hidden" v-model="data[field]" />
              </template>
              <template v-else-if="field === 'initial_stock'">
                <InputNumber v-model="data[field]" inputId="horizontal-buttons" showButtons buttonLayout="horizontal" :step="1">
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
                <InputNumber v-model="data[field]" mode="currency" currency="IDR" locale="id-ID" :formatter="formatIDR" autofocus fluid />
              </template>
              <template v-else-if="field === 'total_price'">
                <span>{{ data[field] }}</span>
              </template>
              <template v-else-if="field === 'labor_cost'">
                <InputNumber v-model="data[field]" mode="currency" currency="IDR" locale="id-ID" :formatter="formatIDR" autofocus fluid />
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
  
      <div class="col-span-1 md:col-span-4">
        <label for="shipping_cost" class="block font-bold mb-3">Shipping Cost</label>
        <InputNumber id="shipping_cost" v-model="formData.shipping_cost" mode="currency" currency="IDR" locale="id-ID" :formatter="formatIDR" fluid />
      </div>
      <div class="col-span-1 md:col-span-4">
        <label for="other_fee" class="block font-bold mb-3">Other Fee</label>
        <InputNumber id="other_fee" v-model="formData.other_fee" mode="currency" currency="IDR" locale="id-ID" :formatter="formatIDR" fluid />
      </div>
      <div class="col-span-1 md:col-span-4">
        <label for="notes" class="block font-bold mb-3">Notes</label>
        <InputText type="text" v-model="formData.notes" fluid />
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
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
  
  const toast = useToast();
  const router = useRouter();
  const route = useRoute();
  const incomingItemStore = useIncomingItemStore();
  const supplierStore = useSupplierStore();
  const itemStore = useItemStore();
  const formData = ref({
    id: '',
    incoming_item_code: '',
    supplier_id: '',
    shipment_date: '',
    received_date: '',
    shipping_cost: 0,
    other_fee: 0,
    notes: '',
  });

  const item = ref({});
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
  const supplierOptions = ref([]);
  const selectedProduct = ref(null);
  const filteredProducts = ref([]);
  
  const fetchItemDetails = async (id) => {
    const data = await incomingItemStore.fetchIncomingItem(id);
    // formData.value = { ...data };
    // products.value = data.details; // Assuming the details are fetched along with the item
  };
  
  const fetchSuppliers = async () => {
    const response = await supplierStore.fetchSuppliers();
    supplierOptions.value = response.map(supplier => ({
      label: supplier.supplier_name,
      value: supplier.id,
    }));
  };
  
  const fetchItems = async () => {
    const fetchedItems = await itemStore.fetchItems();
    filteredProducts.value = fetchedItems.map(item => ({
      ...item,
      concat_code_name: `${item.item_code} - ${item.item_name}`,
    }));
  };
  
  const formatIDR = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(value);
  };
  
  const totalItemPrice = computed(() => {
    return products.value.reduce((total, product) => total + (parseFloat(product.total_price) || 0), 0);
  });
  
  const totalLaborCost = computed(() => {
    return products.value.reduce((total, product) => total + (parseFloat(product.labor_cost * product.initial_stock) || 0), 0);
  });
  
  const grandTotal = computed(() => {
    return totalItemPrice.value + totalLaborCost.value + (parseFloat(formData.value.other_fee) || 0) + (parseFloat(formData.value.shipping_cost) || 0);
  });
  
  const addProduct = () => {
    if (selectedProduct.value) {
      const newProduct = {
        item_id: selectedProduct.value.id,
        name: selectedProduct.value.concat_code_name,
        // Add any other necessary fields
      };
      products.value.push(newProduct);
      selectedProduct.value = null; // Reset after adding
    }
  };
  
  const deleteRow = (data) => {
    products.value = products.value.filter(product => product !== data);
  };
  
  const save = async () => {
    try {
      formData.value.labor_cost = totalLaborCost.value;
      formData.value.total_item_price = totalItemPrice.value;
      formData.value.total_cost = grandTotal.value;

      await incomingItemStore.updateIncomingItem({
        ...formData.value,
        details: products.value,
      });
      toast.add({ severity: 'success', summary: 'Success', detail: 'Incoming Item updated successfully', life: 3000 });
      router.push('/pages/incoming-items');
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update incoming item', life: 3000 });
    }
  };
  
  const cancelForm = () => {
    router.push('/pages/incoming-items');
  };

  const fetchIncomingItem = async (id) => {
    await incomingItemStore.fetchIncomingItem(id);    
    formData.value = { ...incomingItemStore.incomingItem };    
    products.value = incomingItemStore.incomingItemDetails || []
 };

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

  
  onMounted(() => {
    const { id } = route.params; // Get the id from route params
    fetchItemDetails(id);
    fetchIncomingItem(id);
    fetchSuppliers();
    fetchItems();
  });
  </script>
  