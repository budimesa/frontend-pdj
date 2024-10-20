// import Login from '../views/Login.vue';
// import UserProfile from '../views/UserProfile.vue';
import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';
// const routes = [
//     { path: '/login', name: 'login',  component: () => import('@/views/pages/auth/Login.vue') },
    
//     // { path: '/profile', component: UserProfile, meta: { requiresAuth: true } },
// ];

// const router = createRouter({
//     history: createWebHistory(),
//     routes,
// });

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/uikit/formlayout',
                    name: 'formlayout',
                    component: () => import('@/views/uikit/FormLayout.vue')
                },
                {
                    path: '/uikit/input',
                    name: 'input',
                    component: () => import('@/views/uikit/InputDoc.vue')
                },
                {
                    path: '/uikit/button',
                    name: 'button',
                    component: () => import('@/views/uikit/ButtonDoc.vue')
                },
                {
                    path: '/uikit/table',
                    name: 'table',
                    component: () => import('@/views/uikit/TableDoc.vue')
                },
                {
                    path: '/uikit/list',
                    name: 'list',
                    component: () => import('@/views/uikit/ListDoc.vue')
                },
                {
                    path: '/uikit/tree',
                    name: 'tree',
                    component: () => import('@/views/uikit/TreeDoc.vue')
                },
                {
                    path: '/uikit/panel',
                    name: 'panel',
                    component: () => import('@/views/uikit/PanelsDoc.vue')
                },

                {
                    path: '/uikit/overlay',
                    name: 'overlay',
                    component: () => import('@/views/uikit/OverlayDoc.vue')
                },
                {
                    path: '/uikit/media',
                    name: 'media',
                    component: () => import('@/views/uikit/MediaDoc.vue')
                },
                {
                    path: '/uikit/message',
                    name: 'message',
                    component: () => import('@/views/uikit/MessagesDoc.vue')
                },
                {
                    path: '/uikit/file',
                    name: 'file',
                    component: () => import('@/views/uikit/FileDoc.vue')
                },
                {
                    path: '/uikit/menu',
                    name: 'menu',
                    component: () => import('@/views/uikit/MenuDoc.vue')
                },
                {
                    path: '/uikit/charts',
                    name: 'charts',
                    component: () => import('@/views/uikit/ChartDoc.vue')
                },
                {
                    path: '/uikit/misc',
                    name: 'misc',
                    component: () => import('@/views/uikit/MiscDoc.vue')
                },
                {
                    path: '/uikit/timeline',
                    name: 'timeline',
                    component: () => import('@/views/uikit/TimelineDoc.vue')
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue')
                },
                {
                    path: '/pages/crud',
                    name: 'crud',
                    component: () => import('@/views/pages/Crud.vue')
                },
                {
                    path: '/pages/users',
                    name: 'users',
                    component: () => import('@/views/pages/master/users/UserCrud.vue')
                },
                {
                    path: '/pages/suppliers',
                    name: 'suppliers',
                    component: () => import('@/views/pages/master/suppliers/SupplierCrud.vue')
                },
                {
                    path: '/pages/customers',
                    name: 'customers',
                    component: () => import('@/views/pages/master/customers/CustomerCrud.vue')
                },
                {
                    path: '/pages/customer-limits',
                    name: 'customer-limits',
                    component: () => import('@/views/pages/master/customer-credit-limits/CustomerCreditLimitCrud.vue')
                },
                {
                    path: '/pages/balances',
                    name: 'balances',
                    component: () => import('@/views/pages/master/customer-balances/CustomerBalances.vue')
                },
                {
                    path: '/pages/balance-deposits',
                    name: 'balance-deposits',
                    component: () => import('@/views/pages/master/customer-balances/CustomerBalanceDeposits.vue')
                },
                {
                    path: '/pages/warehouses',
                    name: 'warehouses',
                    component: () => import('@/views/pages/master/warehouses/WarehouseCrud.vue')
                },
                {
                    path: '/pages/items',
                    name: 'items',
                    component: () => import('@/views/pages/master/items/ItemCrud.vue')
                },
                {
                    path: '/pages/incoming-items',
                    name: 'incoming-items.index',
                    component: () => import('@/views/pages/master/incoming-items/IncomingItems.vue'),
                },
                {
                    path: 'pages/incoming-items/create',
                    name: 'incoming-items.create',
                    component: () => import('@/views/pages/master/incoming-items/IncomingItemCreate.vue'),
                },
                {
                    path: 'pages/incoming-items/edit/:id',
                    name: 'incoming-items.edit',
                    component: () => import('@/views/pages/master/incoming-items/IncomingItemEdit.vue'),
                    props: true // Pass route params as props to the component
                },
                {
                    path: '/pages/item-transfers',
                    name: 'item-transfers.index',
                    component: () => import('@/views/pages/master/item-transfers/ItemTransfers.vue'),
                },
                {
                    path: 'pages/item-transfers/create',
                    name: 'item-transfers.create',
                    component: () => import('@/views/pages/master/item-transfers/ItemTransferCreate.vue'),
                },
                {
                    path: 'pages/item-transfers/edit/:id',
                    name: 'item-transfers.edit',
                    component: () => import('@/views/pages/master/item-transfers/ItemTransferEdit.vue'),
                    props: true // Pass route params as props to the component
                },
                {
                    path: '/pages/inventories',
                    name: 'inventories.index',
                    component: () => import('@/views/pages/master/inventories/Inventory.vue'),
                },
                {
                    path: '/pages/repacks/create',
                    name: 'repacks.create',
                    component: () => import('@/views/pages/master/repacks/RepackCreate.vue'),
                },
                {
                    path: '/pages/repacks',
                    name: 'repacks.index',
                    component: () => import('@/views/pages/master/repacks/Repacks.vue'),
                },
                {
                    path: '/documentation',
                    name: 'documentation',
                    component: () => import('@/views/pages/Documentation.vue')
                }
            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

// Middleware untuk memeriksa autentikasi
router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('token');
    if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
        next('/login');
    } else {
        next();
    }
});

export default router;
