<template>
    <div class="card">
      <h1 class="text-2xl font-bold mb-4">BOM Formula Management</h1>
     <Toolbar class="mb-6">
          <template #start>
              <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="createNew" />            
          </template>
          <template #end>
              <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" />
          </template>
      </Toolbar>
      <!-- DataTable Component -->
      <DataTable v-model:filters="filters" scrollable :value="bomFormulaStore.items" showGridlines :rows="10" dataKey="id"
                filterDisplay="menu" :globalFilterFields="['item_code', 'item_name']">
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
            <template #empty>No BOM Formulas found.</template>
              <Column header="No." style="min-width: 4rem">
                  <template #body="{ index }">
                      {{ bomFormulaStore.pagination.offset + index + 1 }}
                  </template>
              </Column>              
              <Column field="formula" header="Formula" style="min-width: 12rem">
                  <template #body="{ data }">
                      {{ data.formula }}
                  </template>
                  <template #filter="{ filterModel }">
                      <InputText v-model="filterModel.value" type="text" placeholder="Search by code" />
                  </template>
              </Column>
              <Column field="item_code" header="Item Code" style="min-width: 12rem">
                  <template #body="{ data }">
                      {{ data.item_code }}
                  </template>
                  <template #filter="{ filterModel }">
                      <InputText v-model="filterModel.value" type="text" placeholder="Search by code" />
                  </template>
              </Column>                                          
              <Column field="use_priority" header="Use Prio." style="min-width: 12rem">                
                <template #body="{ data }">
                  {{ data.use_priority === 'Y' ? 'Y' : ''  }}
                </template>
              </Column>
              
              <Column :exportable="false" style="min-width: 12rem" header="Actions" alignFrozen="right" frozen>
              <template #body="slotProps">
                  <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="edit(slotProps.data)" />
                  <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDelete(slotProps.data)" />
              </template>
            </Column>
      </DataTable>
  
      <!-- Paginator Component -->
      <Paginator
        v-model:rows="bomFormulaStore.rows"
        :totalRecords="bomFormulaStore.totalRecords"
        :first="bomFormulaStore.first"
        :rowsPerPageOptions="[10, 20, 30]"
        @page="handlePageChange"
      ></Paginator>
    </div>
  
    <Dialog v-model:visible="bomFormulaStore.formDialog" modal header="BOM Formula Details" :modal="true" :style="{ width: '80rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 mt-1">
          <!-- Row 1 -->
          <div class="col-span-1 sm:col-span-2 lg:col-span-4">
              <div class="flex items-center">
                  <label class="w-32 font-semibold">Formula</label>
                  <div class="flex-1">
                      <InputText v-model.trim="item.formula" class="w-full" required />
                  </div>
              </div>
              <small v-if="submitted && !item.formula" class="text-red-500 block mt-1 ml-32">Item Code is required.</small>
          </div>
          <div class="col-span-1 sm:col-span-2 lg:col-span-4">
              <div class="flex items-center">
                  <label class="w-32 font-semibold">Item Code F</label>
                  <div class="flex-1">
                      <InputText v-model.trim="item.item_code" class="w-full" required fluid />
                  </div>
              </div>
              <small v-if="submitted && !item.item_code" class="text-red-500 block mt-1 ml-32">Item Code is required.</small>
          </div>

          <div class="col-span-1 sm:col-span-2 lg:col-span-4">
              <div class="flex items-center">
                  <label class="w-32 font-semibold">Item Unit F</label>
                  <div class="flex-1">
                      <InputText v-model.trim="item.item_code" class="w-full" required fluid />
                  </div>
              </div>
              <small v-if="submitted && !item.item_code" class="text-red-500 block mt-1 ml-32">Item Code is required.</small>
          </div>          
          <div class="col-span-1 sm:col-span-2 lg:col-span-4">
              <div class="flex items-center">
                  <label class="w-32 font-semibold">Item Spec F</label>
                  <div class="flex-1">
                      <InputText v-model.trim="item.item_code" class="w-full" required fluid />
                  </div>
              </div>
              <small v-if="submitted && !item.item_code" class="text-red-500 block mt-1 ml-32">Item Code is required.</small>
          </div>          
          <div class="col-span-1 sm:col-span-2 lg:col-span-4">
              <div class="flex items-center">
                  <label class="w-32 font-semibold">Item Name F</label>
                  <div class="flex-1">
                      <InputText v-model.trim="item.item_code" class="w-full" required fluid />
                  </div>
              </div>
              <small v-if="submitted && !item.item_code" class="text-red-500 block mt-1 ml-32">Item Code is required.</small>
          </div>
          <div class="col-span-1 sm:col-span-2 lg:col-span-4">
              <div class="flex items-center">
                  <label class="w-32 font-semibold">Use Priority</label>
                  <div class="flex-1">
                    <Dropdown
                    v-model="item.use_priority"
                    :options="priorityType"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select use priority"
                    class="w-full"
                    />
                  </div>
              </div>
              <small v-if="submitted && !item.item_code" class="text-red-500 block mt-1 ml-32">Item Code is required.</small>
          </div>           
      </div>
      <template #footer>
          <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
          <Button label="Save" icon="pi pi-check" @click="save" :disabled="bomFormulaStore.isSaving" />
      </template>
     </Dialog>
  
  
    <Dialog v-model:visible="bomFormulaStore.deleteDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
          <div class="flex items-center gap-4">
              <i class="pi pi-exclamation-triangle !text-3xl" />
              <span v-if="item"
                  >Apakah anda yakin ingin menghapus <b>{{ item.name }}</b
                  >?</span
              >
          </div>
          <template #footer>
              <Button label="No" icon="pi pi-times" text @click="hideDeleteDialog" />
              <Button label="Yes" icon="pi pi-check" @click="deleteItem" :disabled="bomFormulaStore.isDeleting" />
          </template>
    </Dialog>
  </template>
  
  <script setup>
  import { useBomFormulaStore } from '@/stores/bomFormula';
import { FilterMatchMode } from '@primevue/core/api';
import { useDebounce } from '@vueuse/core';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
  
  const item = ref({});
  const submitted = ref(false);
  const isEditMode = ref(false);
  const toast = useToast();
  const bomFormulaStore = useBomFormulaStore();  
  const filters = ref({});
  const router = useRouter();
  const priorityType = [
  { label: 'Y', value: 'Y' },
  { label: 'Temporary No Use', value: '' },
];
  
  const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        item_code: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        formula: { value: null, matchMode: FilterMatchMode.STARTS_WITH },      
    };
  };
  
  initFilters();
  
  const clearFilter = () => {
    initFilters();
  };
  
  const debouncedFilters = useDebounce(filters, 300);
  
  // Watch for changes in debounced filters
  watch(debouncedFilters, () => {
    fetchData(1); // Fetch data for the current page when filters change
  }, { deep: true }); 
  
  
  const hideDialog = () => {
    bomFormulaStore.formDialog = false;
    submitted.value = false;
  };

  const createNew = () => {
    router.push('/pages/bom-formula/create');
  };
  

  const fetchMergedRawAndWIP = async () => {
    await bomFormulaStore.fetchMergeRawMaterialAndWIP();
  }
  
  const fetchData = async (page = 1) => {
    await bomFormulaStore.fetchBomFormulas(page, filters.value);
  };
  
  const handlePageChange = (event) => {  
    fetchData(event.page + 1);
  };
  
  // Watch for changes in rows
  watch(bomFormulaStore.rows, () => {  
    fetchData(1); // Fetch data for the first page with the new per_page value
  });
  
  onMounted(() => {  
    fetchData();
    fetchMergedRawAndWIP();    
  });
  const save = async () => {
    submitted.value = true;
    if (item.value.item_code.trim() && item.value.formula.trim()) {
      try {
        if (isEditMode.value) {
          await bomFormulaStore.updateBomFormula({
            ...item.value,
          });
          toast.add({ severity: 'success', summary: 'Success', detail: 'BOM Formula updated successfully', life: 3000 });
        } else {        
          await bomFormulaStore.createBomFormula({
            ...item.value,
          });
          toast.add({ severity: 'success', summary: 'Success', detail: 'BOM Formula created successfully', life: 3000 });
        }
        fetchData();
        hideDialog();
      } catch (error) {
        console.error('Error saving BOM Formula:', error.response.data);
        // toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save BOM Formula', life: 3000 });
      }
    }
  };
  
  const edit = async (bomFormulaData) => {
    router.push({ name: 'bom-formula.edit', params: { id: bomFormulaData.id } });
  };
  
  const confirmDelete = (emp) => {
    item.value = emp;
    bomFormulaStore.deleteDialog = true;
  };
  const deleteItem = async () => {
    await bomFormulaStore.deleteBomFormula(item.value.id);
    toast.add({ severity: 'success', summary: 'Successful', detail: 'BOM Formula deleted successfully', life: 3000 });
    hideDeleteDialog();
  };
  
  const hideDeleteDialog = () => {
    bomFormulaStore.deleteDialog = false;
  };
  </script>
  
  <style>
  .card {
    padding: 20px;
  }
  </style>
  