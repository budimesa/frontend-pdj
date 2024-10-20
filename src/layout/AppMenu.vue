<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
    },
    {
        label: 'User',
        items: [
            {
                label: 'Master User',
                icon: 'pi pi-fw pi-user',
                to: '/pages/users'
            },
        ]
    },
    {
        label: 'Supplier',
        items: [
            {
                label: 'Master Supplier',
                icon: 'pi pi-fw pi-users',
                to: '/pages/suppliers'
            },
        ]
    },
    {
        label: 'Pelanggan',
        items: [
            {
                label: 'Master Pelanggan',
                icon: 'pi pi-fw pi-user-plus',
                to: '/pages/customers'
            },

            {
                label: 'Limit Kredit',
                icon: 'pi pi-fw pi-credit-card',
                to: '/pages/customer-limits'
            },
            
            {
                label: 'Saldo Pelanggan',
                icon: 'pi pi-fw pi-wallet',
                items: [
                    {
                        label: 'Saldo',
                        icon: 'pi pi-fw pi-wallet',
                        to: '/pages/balances'
                    },
                    {
                        label: 'Deposit Saldo',
                        icon: 'pi pi-fw pi-plus-circle',
                        to: '/pages/balance-deposits'
                    },                              
                ]
            }
        ]
    },
    {
        label: 'Gudang',
        items: [
            {
                label: 'Master Gudang',
                icon: 'pi pi-fw pi-building',
                to: '/pages/warehouses'
            },
            {
                label: 'Transfer Barang',
                icon: 'pi pi-fw pi-send',
                to: '/pages/item-transfers'
            },
        ]
    },
    {
        label: 'Barang',
        items: [
            {
                label: 'Master Barang',
                icon: 'pi pi-fw pi-box',
                to: '/pages/items'
            },
            {
                label: 'Barang Masuk',
                icon: 'pi pi-fw pi-inbox',
                to: '/pages/incoming-items'
            },
            {
                label: 'Repack Barang',
                icon: 'pi pi-fw pi-table',
                to: '/pages/repacks'
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
