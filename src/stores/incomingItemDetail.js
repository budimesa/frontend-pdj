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

export const useIncomingItemDetailStore = defineStore('incomingItemDetail', {
    state: () => ({
        incomingItemDetails: [],
    }),
    actions: {
        async fetchIncomingItemDetails() {
            const response = await apiClient.get('/incoming-items');
            this.incomingItemDetails = response.data.map(incomingItemDetail => ({
                ...incomingItemDetail,
                created_at: new Date(incomingItemDetail.created_at), // Mengonversi ke objek Date
                updated_at: new Date(incomingItemDetail.updated_at),
            }));
            return this.incomingItemDetails;
        },
        async createIncomingItemDetail({incoming_item_id, item_id, batch_id, barcode_number, gross_weight, net_weight, storage_weight, unit_price, quantity, total_price, labor_cost, expiry_date}) {
            await apiClient.post('/incoming-items', { incoming_item_id, item_id, batch_id, barcode_number, gross_weight, net_weight, storage_weight, unit_price, quantity, total_price, labor_cost, expiry_date});
            await this.fetchIncomingItemDetails(); // Refresh the item list
        },
        async updateIncomingItemDetail({id, incoming_item_id, item_id, batch_id, barcode_number, gross_weight, net_weight, storage_weight, unit_price, quantity, total_price, labor_cost, expiry_date}) {
            await apiClient.put(`/incoming-items/${id}`, { incoming_item_id, item_id, batch_id, barcode_number, gross_weight, net_weight, storage_weight, unit_price, quantity, total_price, labor_cost, expiry_date});
            await this.fetchIncomingItemDetails(); // Refresh the item list
        },
        async deleteIncomingItemDetail(id) {
            await apiClient.delete(`/incoming-items/${id}`);
            await this.fetchIncomingItemDetails(); // Refresh the item list
        },
    },
});
