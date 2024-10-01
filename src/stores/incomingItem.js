import axios from 'axios';
import { defineStore } from 'pinia';
const apiClient = axios.create({
    baseURL: 'http://backend-pdj.test/api/',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    withCredentials: true,
    withXSRFToken: true
});

export const useIncomingItemStore = defineStore('incomingItem', {
    state: () => ({
        incomingItems: [],
    }),
    actions: {
        async fetchIncomingItems() {
            const response = await apiClient.get('/incoming-items');
            this.incomingItems = response.data.map(incomingItem => ({
                ...incomingItem,
                created_at: new Date(incomingItem.created_at), // Mengonversi ke objek Date
                updated_at: new Date(incomingItem.updated_at),
            }));
            return this.incomingItems;
        },
        async createIncomingItem({incoming_item_code, supplier_id, warehouse_id, shipment_date, received_date, total_item_price, shipping_cost, labor_cost, other_fee, total_cost, notes, invoice_files}) {
            await apiClient.post('/incoming-items', { incoming_item_code, supplier_id, warehouse_id, shipment_date, received_date, total_item_price, shipping_cost, labor_cost, other_fee, total_cost, notes, invoice_files});
            await this.fetchIncomingItems(); // Refresh the item list
        },
        async updateIncomingItem({id, incoming_item_code, supplier_id, warehouse_id, shipment_date, received_date, total_item_price, shipping_cost, labor_cost, other_fee, total_cost, notes, invoice_files}) {
            await apiClient.put(`/incoming-items/${id}`, { incoming_item_code, supplier_id, warehouse_id, shipment_date, received_date, total_item_price, shipping_cost, labor_cost, other_fee, total_cost, notes, invoice_files});
            await this.fetchIncomingItems(); // Refresh the item list
        },
        async deleteIncomingItem(id) {
            await apiClient.delete(`/incoming-items/${id}`);
            await this.fetchIncomingItems(); // Refresh the item list
        },
    },
});
