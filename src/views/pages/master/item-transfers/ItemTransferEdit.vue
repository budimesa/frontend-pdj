<template>
    <div class="card grid grid-cols-1 md:grid-cols-12 gap-6">
        <div class="col-span-1 md:col-span-3">
            <label for="transfer_code" class="block font-bold mb-3">Kode Transfer Barang</label>            
            <InputText type="text" v-model="formData.transfer_code" fluid disabled/>
        </div>
        <div class="col-span-1 md:col-span-3">
            <label for="transfer_date" class="block font-bold mb-3">Tanggal Transfer</label>            
            <DatePicker v-model="formData.transfer_date" :showIcon="true" :showButtonBar="true" dateFormat="dd/mm/yy" fluid/>
        </div>
        <div class="col-span-1 md:col-span-3">
            <label for="warehouse" class="block font-bold mb-3">Gudang Asal</label>            
            <Dropdown 
              v-model="formData.from_warehouse_id" 
              :options="warehouseStore.warehouseOptions" 
              optionLabel="label" 
              optionValue="value"
              :placeholder="selectedOption ? selectedOption.label : 'Pilih gudang'"
              filter 
              showClear 
              fluid
              />
        </div>
        <div class="col-span-1 md:col-span-3">
            <label for="warehouse" class="block font-bold mb-3">Gudang Tujuan</label>            
            <Dropdown 
              v-model="formData.to_warehouse_id" 
              :options="warehouseStore.warehouseOptions" 
              optionLabel="label" 
              optionValue="value"
              :placeholder="selectedOption ? selectedOption.label : 'Pilih gudang'"
              filter 
              showClear 
              fluid
              />
        </div>
        <div class="col-span-1 md:col-span-12">
          <label for="product" class="block font-bold mb-3">Product</label> 
          <Dropdown 
            v-model="selectedProduct" 
            :options="inventoryStore.filteredProducts" 
            optionLabel="concat_inventory" 
            @change="addProduct"
            filter 
            filterBy="concat_inventory" 
            placeholder="Select a Product" 
            class="w-full"
            fluid
          />
        </div>
        <div class="col-span-1 md:col-span-12">
          <DataTable :value="products" editMode="cell" @cell-edit-complete="onCellEditComplete" scrollable>
            <template #empty>
                <div class="flex items-center justify-center h-full">
                    <span>Data belum ditambahkan.</span>
                </div>
            </template>
            <Column  v-for="col in columns" :key="col.field" :field="col.field" :header="col.header"
                  :class="[{ 'hidden': col.field === 'item_id' || col.field === 'max_stock' }]">                
                <template #body="{ data, field }">
                    <!-- <span v-if="field !== 'code'">{{ field === 'total_price' ? formatIDR(data[field]) : data[field] }}</span> -->
                    <span v-if="field !== 'code'">{{  data[field] }}</span>
                    <input v-if="field === 'code'" type="hidden" v-model="data[field]" />
                    
                </template>
                <template #editor="{ data, field }">
                    <template v-if="field === 'item_id'">
                        <input type="hidden" v-model="data[field]" />
                    </template>                    
                    <template v-if="field === 'max_stock'">
                        <input type="hidden" v-model="data[field]" />
                    </template>                    
                    <template v-else-if="field === 'incoming_item_code'">
                        <span>{{ data[field] }}</span>
                    </template>
                    <template v-else-if="field === 'batch_code'">
                        <span>{{ data[field] }}</span>
                    </template>
                    <!-- <template v-else-if="field === 'warehouse_name'">
                        <span>{{ data[field] }}</span>
                    </template> -->
                    <template v-else-if="field === 'concat_code_name'">
                        <span>{{ data[field] }}</span>
                    </template>
                    <template v-else-if="field === 'net_weight'">
                        <span>{{ data[field] }}</span>
                    </template>
                    <template v-else-if="field === 'actual_stock'">
                      <InputNumber 
                            v-model="data[field]" 
                            inputId="horizontal-buttons" 
                            showButtons 
                            buttonLayout="horizontal" 
                            :max="data['max_stock']" 
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
                    <template v-else-if="field === 'unit_price'">
                      <span>{{ data[field] }}</span>
                    </template>
                    <template v-else-if="field === 'total_price'">
                      <span>{{ data[field] }}</span>
                    </template>                 
                    <template v-else>
                        <InputText v-model="data[field]" autofocus fluid />
                    </template>
                </template>
            </Column>
            <Column header="Tindakan" alignFrozen="right" frozen>
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
                          <th class="py-2 px-4 text-left">Deskripsi</th>
                          <th class="py-2 px-4 text-right">Jumlah</th>
                      </tr>
                  </thead>
                  <tbody>                  
                      <tr class="border-b hover:bg-gray-50">
                          <td class="py-2 px-4">Total Harga Barang:</td>
                          <td class="py-2 px-4 text-right">{{ formatIDR(totalItemPrice) }}</td>
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
            <label for="other_fee" class="block font-bold mb-3">Biaya Lain-lain</label>
            <InputNumber id="other_fee" v-model="formData.other_fee" mode="currency" currency="IDR"
              locale="id-ID"
              :formatter="formatIDR" fluid />
        </div>
        <div class="col-span-1 md:col-span-4">
            <label for="notes" class="block font-bold mb-3">Keterangan</label>
            <InputText type="text" v-model="formData.notes" fluid/>
        </div>
        <div class="col-span-1 md:col-span-12 flex justify-end mt-4">
          <Button label="Cancel" icon="pi pi-times" text @click="cancelForm" />
          <Button label="Save" icon="pi pi-check" @click="save" :disabled="isSaving" class="ml-2" />
      </div>
    </div>
    
  </template>
  
  
<script setup>
import { useInventoryStore } from '@/stores/inventory';
import { useItemTransferStore } from '@/stores/itemTransfer';
import { useWarehouseStore } from '@/stores/warehouse';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
  
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
  const route = useRoute();
  const filters = ref({});
  const submitted = ref(false);
  const isSaving = ref(false);
  const warehouseStore = useWarehouseStore();
  const itemTransferStore = useItemTransferStore();
  const inventoryStore = useInventoryStore();
  const selectedProduct = ref(null);
  
  const totalItemPrice = computed(() => {
    return products.value.reduce((total, product) => {
      return total + (parseFloat(product.total_price) || 0);
    }, 0);
  });
  
  // Computed property untuk menghitung grand total
  const grandTotal = computed(() => {
    return totalItemPrice.value + (parseFloat(formData.value.other_fee) || 0) + (parseFloat(formData.value.shipping_cost) || 0);
  });
  
  const formData = ref({ 
    id: '',
    transfer_code: '',
    transfer_date: '',
    total_item_price: '',
    shipping_cost: '',
    other_fee: '',
    total_cost: '',
    notes: '',
  
  });
  
  const addProduct = () => {
      if (selectedProduct.value) {
          const existingProduct = products.value.find(product => product.inventory_id === selectedProduct.value.inventory_id);        
            if (!existingProduct) {
              const newProduct = {
                inventory_id : selectedProduct.value.inventory_id,
                item_id : selectedProduct.value.item_id,
                incoming_item_id : selectedProduct.value.incoming_item_id,
                incoming_item_code : selectedProduct.value.incoming_item_code,
                batch_id : selectedProduct.value.batch_id,
                batch_code : selectedProduct.value.batch_code,
                barcode_number : selectedProduct.value.barcode_number,
                warehouse_name: selectedProduct.value.warehouse_name,
                description : selectedProduct.value.description,
                gross_weight : selectedProduct.value.gross_weight,
                labor_cost : selectedProduct.value.labor_cost,
                concat_code_name: selectedProduct.value.concat_code_name,
                net_weight: selectedProduct.value.net_weight,
                initial_stock: selectedProduct.value.initial_stock,
                actual_stock: selectedProduct.value.actual_stock,
                max_stock: selectedProduct.value.actual_stock,
                unit_price: selectedProduct.value.unit_price,
                total_price: selectedProduct.value.total_price,
                notes: selectedProduct.value.notes,
            };
            products.value.push(newProduct);
            selectedProduct.value = null; // Reset after adding
            }
            else {
                alert('This product has already been added.'); // Or any other way to show the message
            }
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
      // { field: 'warehouse_name', header: 'Warehouse' },
      { field: 'incoming_item_code', header: 'Incoming Item Code' },
      { field: 'batch_code', header: 'Batch Code' },
      { field: 'concat_code_name', header: 'Item' },
      { field: 'net_weight', header: 'Neto (KG)' },
      { field: 'actual_stock', header: 'Quantity' },
      { field: 'max_stock', header: 'Max Stock' },
      { field: 'unit_price', header: 'Unit Price' },
      { field: 'total_price', header: 'Total Price' },
      { field: 'notes', header: 'Notes' },
  ]);
  
  const onCellEditComplete = (event) => {
      let { data, newValue, field } = event;
  
      switch (field) {
          case 'net_weight':
          case 'actual_stock':
          case 'unit_price':
              if (isPositiveInteger(newValue) || field === 'unit_price') {
                  data[field] = newValue;
  
                  // Hitung total_price otomatis
                  const unitPrice = parseFloat(data.unit_price) || 0;
                  const netWeight = parseFloat(data.net_weight) || 0;
                  const actual_stock = parseFloat(data.actual_stock) || 0;
                  data.total_price = (unitPrice * actual_stock * netWeight); // Menyimpan total_price sebagai string dengan 2 desimal
              } else {
                  event.preventDefault();
              }
              break;
  
          case 'total_price':
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

  const fetchItemTransfer = async (id) => {
    await itemTransferStore.fetchItemTransfer(id);    
    formData.value = { ...itemTransferStore.itemTransfer };    
    products.value = itemTransferStore.itemTransferDetails || []    
 };
  
  onMounted(() => {
      const { id } = route.params;      
      // itemTransferStore.fetchItemTransfer(id);
    //   itemTransferStore.fetchItemTransferDetails(id);
      fetchItemTransfer(id);
      inventoryStore.fetchInventoryOptions();
      warehouseStore.fetchWarehouseOptions();
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
  const resetForm = () => {
      formData.value = { item_code: '', item_name: '', notes: '' };
      submitted.value = false;
  };
  
  const cancelForm = () => {
    router.push('/pages/incoming-items/');
    resetForm();
  };

  const getFormattedDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear(); // Ambil tahun
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Ambil bulan dan tambahkan 1 (0-11 ke 1-12), lalu format menjadi 2 digit
    const day = String(d.getDate()).padStart(2, '0'); // Ambil hari dan format menjadi 2 digit

    return `${year}-${month}-${day}`;
  };

  const totalItemQuantity = computed(() => {
    return products.value.reduce((total, product) => {
      return total + (parseFloat(product.actual_stock) || 0);
    }, 0);
  });
  
  const save = async () => {
    submitted.value = true;
    isSaving.value = true; 
    try {
        formData.value.transfer_date = getFormattedDate(formData.value.transfer_date);        
        formData.value.total_item_price = totalItemPrice.value;
        formData.value.total_quantity = totalItemQuantity.value;
        formData.value.total_cost = grandTotal.value;
  
        await itemTransferStore.updateItemTransfer({
          ...formData.value,
          details: products.value
        });
          
        toast.add({ severity: 'success', summary: 'Success', detail: 'item transfer updated successfully', life: 3000 });     
        // router.push('/pages/incoming-items');
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update item transfers', life: 3000 });
      } finally {
        isSaving.value = false; // Set to false after the process is complete
      }
  };
  
  </script>
  
  