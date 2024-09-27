<template>
    <div class="card">
        <h1 class="text-2xl font-bold mb-4">BOM Formula</h1>
        <Dropdown 
            v-model="selectedProduct" 
            :options="filteredProducts" 
            optionLabel="name" 
            @change="addProduct"
            filter 
            filterBy="name" 
            placeholder="Select a Product" 
            class="w-full"
        />
    </div>
    <div class="card">
        <DataTable :value="products" editMode="cell" @cell-edit-complete="onCellEditComplete"
            :pt="{
                table: { style: 'min-width: 50rem' },
                column: {
                    bodycell: ({ state }) => ( {
                        class: [{ 'pt-0 pb-0': state['d_editing'] }]
                    })
                }
            }"
        >
            <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header" style="width: 25%">
                <template #body="{ data, field }">
                    {{ field === 'price' ? formatCurrency(data[field]) : data[field] }}
                </template>
                <template #editor="{ data, field }">
                    <template v-if="field !== 'price'">
                        <InputText v-model="data[field]" autofocus fluid />
                    </template>
                    <template v-else>
                        <InputNumber v-model="data[field]" mode="currency" currency="USD" locale="en-US" autofocus fluid />
                    </template>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";

const itemsData = [
    { code: "P002", name: "PRODUCT 2" },
    { code: "P003", name: "PRODUCT 3" },
    { code: "P004", name: "PRODUCT 4" },
    { code: "P005", name: "PRODUCT 5" },
    { code: "P006", name: "PRODUCT 6" },
    { code: "P007", name: "PRODUCT 7" },
    { code: "P008", name: "PRODUCT 8" },
];

const items = ref(itemsData);
const selectedProduct = ref(null);
const filteredProducts = ref([]);

const search = (event) => {
    const query = event.target.value.toLowerCase();
    filteredProducts.value = items.value.filter(item => item.name.toLowerCase().includes(query));
};

const addProduct = () => {
    if (selectedProduct.value) {
        const newProduct = {
            code: selectedProduct.value.code,
            name: selectedProduct.value.name,
            quantity: 1, // Default value if needed
            price: 0, // Default price if needed
        };
        products.value.push(newProduct);
        selectedProduct.value = null; // Reset after adding
    }
};

const products = ref([
    { code: 'P001', name: 'Product 1', quantity: 10, price: 25.00 },
]);

const columns = ref([
    { field: 'code', header: 'Code' },
    { field: 'name', header: 'Name' },
    { field: 'quantity', header: 'Quantity' },
    { field: 'price', header: 'Price' }
]);

const onCellEditComplete = (event) => {
    let { data, newValue, field } = event;

    switch (field) {
        case 'quantity':
        case 'price':
            if (isPositiveInteger(newValue)) data[field] = newValue;
            else event.preventDefault();
            break;

        default:
            if (newValue.trim().length > 0) data[field] = newValue;
            else event.preventDefault();
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
    filteredProducts.value = [...items.value];
});
</script>
