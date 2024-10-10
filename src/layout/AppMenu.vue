<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
    },
    {
        label: 'Users',
        items: [
            {
                label: 'User Management',
                icon: 'pi pi-fw pi-user',
                to: '/pages/users'
            },
        ]
    },
    {
        label: 'Suppliers',
        items: [
            {
                label: 'Supplier Management',
                icon: 'pi pi-fw pi-users',
                to: '/pages/suppliers'
            },
        ]
    },
    {
        label: 'Customers',
        items: [
            {
                label: 'Customer Management',
                icon: 'pi pi-fw pi-user-plus',
                to: '/pages/customers'
            },

            {
                label: 'Credit Limit',
                icon: 'pi pi-fw pi-credit-card',
                to: '/pages/customer-limits'
            },
            
            {
                label: 'Customer Balance',
                icon: 'pi pi-fw pi-bookmark',
                items: [
                    {
                        label: 'Balance',
                        icon: 'pi pi-fw pi-bookmark',
                        to: '/pages/balances'
                    },                    
                    {
                        label: 'Balance Deposit',
                        icon: 'pi pi-fw pi-bookmark',
                        to: '/pages/balance-deposits'
                    },                    
                ]
            }
        ]
    },
    {
        label: 'Warehouses',
        items: [
            {
                label: 'Warehouse Management',
                icon: 'pi pi-fw pi-building',
                to: '/pages/warehouses'
            },
        ]
    },
    {
        label: 'Items',
        items: [
            {
                label: 'Item Management',
                icon: 'pi pi-fw pi-box',
                to: '/pages/items'
            },
            {
                label: 'Incoming Items',
                icon: 'pi pi-fw pi-inbox',
                to: '/pages/incoming-items'
            },
            {
                label: 'Inventory',
                icon: 'pi pi-fw pi-database',
                to: '/pages/inventories'
            },
        ]
    },
    
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
