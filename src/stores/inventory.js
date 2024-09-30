import axios from 'axios';
import { defineStore } from 'pinia';
const apiClient = axios.create({
    baseURL: 'http://backend-pdj.test/api/',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getInventory('token')}`
    },
    withCredentials: true,
    withXSRFToken: true
});

export const useInventoryStore = defineStore('inventory', {
    state: () => ({
        inventories: [],
        inventory: {},
        loading: false
    }),
    actions: {
        async fetchInventories() {
            const response = await apiClient.get('/inventories');
            this.inventories = response.data.map(inventory => ({
                ...inventory,
                created_at: new Date(inventory.created_at), // Mengonversi ke objek Date
                updated_at: new Date(inventory.updated_at),
            }));
            return this.inventories;
        },
        async createInventory({incoming_item_id, item_id, batch_id, description, barcode_number, gross_weight, net_weight, actual_weight, unit_price, avaiable_stock, actual_stock, total_price, labor_cost, expiry_date}) {
            await apiClient.post('/inventories', { incoming_item_id, item_id, batch_id, description, barcode_number, gross_weight, net_weight, actual_weight, unit_price, avaiable_stock, actual_stock, total_price, labor_cost, expiry_date});
            await this.fetchInventories(); // Refresh the inventory list
        },
        async updateInventory({id, incoming_item_id, item_id, batch_id, description, barcode_number, gross_weight, net_weight, actual_weight, unit_price, avaiable_stock, actual_stock, total_price, labor_cost, expiry_date}) {
            await apiClient.put(`/inventories/${id}`, { incoming_item_id, item_id, batch_id, description, barcode_number, gross_weight, net_weight, actual_weight, unit_price, avaiable_stock, actual_stock, total_price, labor_cost, expiry_date});
            await this.fetchInventories(); // Refresh the inventory list
        },
        async deleteInventory(id) {
            await apiClient.delete(`/inventories/${id}`);
            await this.fetchInventories(); // Refresh the inventory list
        },
    }
})