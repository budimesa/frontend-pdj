<template>
    <div class="card grid grid-cols-1 md:grid-cols-12 gap-6">
        <div class="col-span-1 md:col-span-4">
            <label for="repack_date" class="block font-bold mb-3">Tanggal Repack</label>            
            <DatePicker v-model="formData.repack_date" :showIcon="true" :showButtonBar="true" dateFormat="dd/mm/yy" fluid/>
        </div>
        <div class="col-span-1 md:col-span-4">
            <label for="warehouse" class="block font-bold mb-3">Gudang</label>            
            <Dropdown 
              v-model="formData.warehouse_id" 
              :options="warehouseStore.warehouseOptions" 
              :disabled="isDisabled"
              optionLabel="label" 
              optionValue="value"
              :placeholder="selectedOption ? selectedOption.label : 'Pilih gudang'"
              filter 
              showClear 
              fluid
              />
        </div>
        <div class="col-span-1 md:col-span-4">
            <label for="repack_weight" class="block font-bold mb-3">Berat Repack Eceran (KG)</label>
            <InputNumber v-model="formData.repack_weight" fluid/>
        </div>
        
        <div class="col-span-1 md:col-span-12">
          <label for="product" class="block font-bold mb-3">Barang</label> 
          <Dropdown 
            v-model="selectedProduct" 
            :disabled="!formData.warehouse_id"
            :options="inventoryStore.filteredProducts" 
            optionLabel="concat_inventory" 
            @change="addProduct"
            filter 
            filterBy="concat_inventory" 
            placeholder="Pilih barang" 
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
                    <!-- <span v-if="field !== 'code'">{{ field === 'total_price' ? $formatIDR(data[field]) : data[field] }}</span> -->
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
                    <template v-else-if="field === 'name'">
                        <span>{{ data[field] }}</span>
                    </template>
                    <template v-else-if="field === 'net_weight'">
                        <span>{{ data[field] }}</span>
                    </template>
                    <template v-else-if="field === 'quantity'">
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
                    <template v-else>
                        <InputText v-model="data[field]" autofocus fluid />
                    </template>
                </template>
            </Column>
            <Column header="Aksi" alignFrozen="right" frozen>
                <template #body="{ data }">
                  <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteRow(data)" />
                </template>
            </Column>
          </DataTable>
        </div>
        <div class="col-span-1 md:col-span-12 flex justify-end mt-4">
          <Button label="Batal" icon="pi pi-times" text @click="cancelForm" />
          <Button label="Simpan" icon="pi pi-check" @click="save" :disabled="isSaving" class="ml-2" />
        </div>
    </div>
    
  </template>
  
  
<script setup>
import { useInventoryStore } from '@/stores/inventory';
import { useItemTransferStore } from '@/stores/itemTransfer';
import { useRepackStore } from '@/stores/repack';
import { useWarehouseStore } from '@/stores/warehouse';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
  
  const selectedOption = ref(null);
  const toast = useToast();
  const dt = ref();
  const router = useRouter();
  const filters = ref({});
  const submitted = ref(false);
  const isSaving = ref(false);
  const warehouseStore = useWarehouseStore();
  const itemTransferStore = useItemTransferStore();
  const inventoryStore = useInventoryStore();
  const repackStore = useRepackStore();
  const selectedProduct = ref(null);
  
  const formData = ref({ 
    repack_date: '',
  });

  const repackTypeOptions = [
    { label: 'Eceran', value: 1 },
    { label: 'Repack Satu Kode', value: 2 },
    { label: 'Repack Banyak Kode', value: 2 },
  ];

  // Watch for changes on warehouse_id
  watch(() => formData.value.warehouse_id, (newVal) => {
    if (newVal) {
      inventoryStore.fetchInventoryDetailOptions(newVal);
    }
  });
  
  const isDisabled = computed(() => products.value.length > 0);
    
  const addProduct = () => {
      if (selectedProduct.value) {
          const existingProduct = products.value.find(product => product.inventory_id === selectedProduct.value.inventory_id);        
            if (!existingProduct) {
              const newProduct = {
                inventory_detail_id : selectedProduct.value.inventory_detail_id,
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
                name: selectedProduct.value.concat_code_name,
                net_weight: selectedProduct.value.net_weight,
                initial_stock: selectedProduct.value.initial_stock,
                quantity: selectedProduct.value.quantity,
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
                alert('Barang ini telah ditambahkan, silahkan pilih yang lain..'); // Or any other way to show the message
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
      { field: 'incoming_item_code', header: 'Kode Barang Masuk' },
      { field: 'batch_code', header: 'Kode Batch' },
      { field: 'name', header: 'Barang' },
      { field: 'net_weight', header: 'Neto (KG)' },
      { field: 'max_stock', header: 'Max Stock' },
      { field: 'notes', header: 'Keterangan' },
  ]);
  
  const onCellEditComplete = (event) => {
      let { data, newValue, field } = event;
  
      switch (field) {
          case 'net_weight':
          case 'quantity':
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
  
  onMounted(() => {
      itemTransferStore.generateNewTransferCode();
      inventoryStore.fetchInventoryDetailOptions();
      warehouseStore.fetchWarehouseOptions();
  });
  
  const initFilters = () => {
      filters.value = {
          global: { value: null, matchMode: FilterMatchMode.CONTAINS },
          item_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
          item_code: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
          created_at: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
      };
  };
  
  initFilters();  
  const resetForm = () => {
      formData.value = { item_code: '', item_name: ''};
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
      return total + (parseFloat(product.quantity) || 0);
    }, 0);
  });
  
  const save = async () => {
    submitted.value = true;
    isSaving.value = true; 
    try {
        formData.value.repack_date = getFormattedDate(formData.value.repack_date);
        formData.value.repack_leftover = products.value[0].net_weight - formData.value.repack_weight;
        await repackStore.createRetailRepack({
          ...formData.value,
          details: products.value
        });
        toast.add({ severity: 'success', summary: 'Success', detail: 'Transfer barang berhasil dibuat', life: 3000 });     
        // router.push('/pages/incoming-items');
      } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal membuat repack eceran', life: 3000 });
      } finally {
        isSaving.value = false; // Set to false after the process is complete
      }
  };
  
  </script>
  
  