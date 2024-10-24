    <template>
        <h1 class="text-2xl font-bold mb-4">BOM Formula</h1>
        <div class="card grid grid-cols-1 sm:grid-cols-12 gap-6">        
            <div class="col-span-1 md:col-span-4">
                <label for="formula" class="block font-bold mb-3">Formula</label>            
                <div class="flex-1">
                    <InputText v-model.trim="item.formula" class="w-full" required />
                </div>
        </div>
        <div class="col-span-1 md:col-span-4">
                <label for="item_code" class="block font-bold mb-3">Kode Barang F</label>
                <div class="flex-1">
                    <InputText v-model.trim="item.item_code" class="w-full" @keyup.enter="validateAndProcessInput" required fluid />
                </div>
        </div>
        <div class="col-span-1 md:col-span-4">
                <label for="unit_usg" class="block font-bold mb-3">Item Unit F</label>            
                <div class="flex-1">
                    <InputText v-model.trim="item.unit_usg" class="w-full" required fluid />
                </div>
        </div>
        <div class="col-span-1 md:col-span-4">
                <label for="item_spec" class="block font-bold mb-3">Item Spec F</label>            
                <div class="flex-1">
                    <InputText v-model.trim="item.item_spec" class="w-full" required fluid />
                </div>
        </div>
        <div class="col-span-1 md:col-span-4">
                <label for="item_name" class="block font-bold mb-3">Nama Barang F</label>            
                <div class="flex-1">
                    <InputText v-model.trim="item.item_name" class="w-full" required fluid />
                </div>
        </div>
        <div class="col-span-1 md:col-span-4">
                <label for="use_priority" class="block font-bold mb-3">Use Priority</label>            
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
        <div class="col-span-1 md:col-span-12">
            <label for="product" class="block font-bold mb-3">Product</label> 
            <Dropdown 
                v-model="selectedProduct" 
                :options="filteredProducts" 
                optionLabel="item_code" 
                @change="addProduct"
                @filter="onFilter"
                filter 
                filterBy="item_code" 
                placeholder="Pilih barang" 
                class="w-full"
            />
        </div>
        </div>
        <div class="card">
            <DataTable :value="products" scrollable editMode="cell" @cell-edit-complete="onCellEditComplete"
                :pt="{
                    table: { style: 'min-width: 50rem' },
                    column: {
                        bodycell: ({ state }) => ( {
                            class: [{ 'pt-0 pb-0': state['d_editing'] }]
                        })
                    }
                }"
                showGridlines dataKey="id"
                filterDisplay="menu"
            >
                <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header">
                    <template #body="{ data, field }">
                        {{ field === 'price' ? formatCurrency(data[field]) : data[field] }}
                    </template>
                    <template #editor="{ data, field }">                    
                        <template v-if="field === 'effective_date' || field === 'expiry_date'">
                            <DatePicker v-model="data[field]" :showIcon="true" showButtonBar="true" dateFormat="dd/mm/yy"/>
                        </template>
                        <template v-else-if="field === 'unit_use'">                            
                            <InputNumber v-model="data[field]" mode="decimal" :minFractionDigits="6" :step="0.01" :min="0" :max="1" @blur="handleBlur(data, field)" />
                        </template>
                        <template v-else-if="field === 'usage_percentage'">
                            <InputNumber v-model="data[field]" mode="decimal" :minFractionDigits="6" :step="0.01" :min="0" :max="100" @blur="handleBlur(data, field)" />
                        </template>
                        <template v-else-if="field === 'qty_std_use' || field === 'unit_usg' || field === 'item_name'">
                            <span>{{ data[field] }}</span>
                        </template>
                        <template v-else-if="field === 'main_material'">
                            <Dropdown v-model="data[field]" :options="mainMaterialOptions" optionLabel="label" optionValue="value" placeholder="Select Main Material" />
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
            <Button label="Batal" icon="pi pi-times" text @click="hideDialog" />
            <Button label="Simpan" icon="pi pi-check" @click="save" :disabled="isSaving" class="ml-2" />
        </div>
    </template>

    <script setup>
    import { useBomFormulaStore } from '@/stores/bomFormula';
import { useBomFormulaDetailStore } from '@/stores/bomFormulaDetail';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from "vue";
import { useRouter } from 'vue-router';

    const items = ref();
    const selectedProduct = ref(null);
    const filteredProducts = ref([]);

    const item = ref({});
    const submitted = ref(false);
    const isEditMode = ref(false);
    const toast = useToast();
    const bomFormulaStore = useBomFormulaStore();
    const bomFormulaDetailStore = useBomFormulaDetailStore();
    const filters = ref({});
    const router = useRouter();
    const priorityType = [
        { label: 'Y', value: 'Y' },
        { label: 'Temporary No Use', value: '' },
    ];

    const mainMaterialOptions = [
        { label: 'Empty', value: '' },
        { label: 'Y | Main Material', value: 'Y' },
        { label: '1 | Auxilary Material', value: '1' },
        { label: '4 | Affal', value: '4' },
    ];

    const onFilter = (event) => {
        fetchMergedRawAndWIP(event.value)
    };

    const addProduct = () => {
        if (selectedProduct.value) {            
            const existingProduct = products.value.find(product => product.item_code === selectedProduct.value.item_code);        
            if (!existingProduct) {
                const newProduct = {                    
                    item_code: selectedProduct.value.item_code,
                    item_spec: selectedProduct.value.item_spec,
                    item_name: selectedProduct.value.item_name,
                    unit_usg: selectedProduct.value.unit_usg,
                };
                products.value.push(newProduct);
                selectedProduct.value = null; // Reset after adding
            } else {
                alert('Barang ini telah ditambahkan, silahkan pilih yang lain..'); // Or any other way to show the message
            }
        }
    };

    const deleteRow = (data) => {
    // Remove the row from the products array
    products.value = products.value.filter(product => product !== data);
    };

    const products = ref([]);

    const columns = ref([
        { field: 'item_code', header: 'Kode Barang' },
        { field: 'item_spec', header: 'Item Spec' },
        { field: 'unit_use', header: 'Unit Use' },
        { field: 'qty_std_use', header: 'Qty Std Use' },
        { field: 'usage_percentage', header: 'Usage Percentage' },
        { field: 'main_material', header: 'Main Material' },
        { field: 'unit_usg', header: 'Unit Usage' },
        { field: 'spar_rate', header: 'Spar Rate' },
        { field: 'item_name', header: 'Nama Barang' },
        { field: 'loss_rate', header: 'Loss Rate' },
        { field: 'effective_date', header: 'Effective Date' },
        { field: 'expiry_date', header: 'Expiry Date' },
    ]);

    const onCellEditComplete = (event) => {
        let { data, newValue, field } = event;

        switch (field) {
            case 'price':
                if (isPositiveInteger(newValue)) data[field] = newValue;
                else event.preventDefault();
                break;

            case 'effective_date':
            case 'expiry_date':
                const date = new Date(newValue);
                if (!isNaN(date.getTime())) { // Check if the date is valid                    
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    data[field] = `${year}-${month}-${day}`; 
                } else {
                    event.preventDefault();
                }
                break;

            case 'unit_use':
            if (typeof newValue === 'number') {
                data[field] = newValue;                
                data['qty_std_use'] = data[field];
                data['usage_percentage'] = data[field] * 100;
            } else {
                event.preventDefault();
            }                        
            break;

            case 'usage_percentage':
            if (typeof newValue === 'number') {
                data[field] = newValue;                
                data['unit_use'] = parseFloat((data['usage_percentage'] / 100).toFixed(6));
                data['qty_std_use'] = data['unit_use'];
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

    const handleBlur = (data, field) => {
        if (field === 'unit_use') {
            data['qty_std_use'] = data['unit_use'];     
            data['usage_percentage'] = data['unit_use'] * 100;       
        }
        else {
            data['unit_use'] = parseFloat((data['usage_percentage'] / 100).toFixed(6));
            data['qty_std_use'] = data['unit_use'];
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

    const validateAndProcessInput = async () => {
        submitted.value = true;
        const code = item.value.item_code;
        const response = await bomFormulaStore.fetchItemPropsByItemCode(code);
        
        if (response) {
            item.value.item_name = response[0].item_name;        
            item.value.unit_usg = response[0].unit_usg;
            item.value.item_spec = response[0].item_spec;
            submitted.value = false;
        }
    }

    const fetchMergedRawAndWIP = async (search = '') => {
        await bomFormulaStore.fetchMergeRawMaterialAndWIP(search);
        items.value = bomFormulaStore.mergedResults.map(item => ({
            ...item,
        }));
        filteredProducts.value = [...items.value];
    }

    onMounted(() => {    
        fetchMergedRawAndWIP();
    });

    const save = async () => {
        submitted.value = true;
        if (item.value.item_code.trim() && item.value.formula.trim()) {
        try {                 
            await bomFormulaStore.createBomFormula({
                ...item.value,
                details: products.value,
            });
            toast.add({ severity: 'success', summary: 'Success', detail: 'BOM Formula created successfully', life: 3000 });
            router.push('/pages/bom-formula');
        } catch (error) {
            console.error('Error saving BOM Formula:', error.response.data);
            // toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save BOM Formula', life: 3000 });
        }
        }
    };
    </script>
