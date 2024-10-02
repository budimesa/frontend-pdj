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
        newItemCode: '',
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
        async fetchLastRow() {
            const response = await apiClient.get('/incoming-item-last-row');
            return response.data
        },
        async generateNewIncomingItemCode() {
          const lastItemCode = await this.fetchLastRow();
          if (!lastItemCode) {
            // Jika tidak ada data, bisa kembalikan default
            return 'BM000001';
          }
          const prefix = lastItemCode.incoming_item_code.slice(0, 2); // Misal 'BM'
          const lastNumber = parseInt(lastItemCode.incoming_item_code.slice(2), 10); // Ambil angka
          const newNumber = lastNumber + 1; // Tambah 1
        
          // Format kode baru
          return this.newItemCode = `${prefix}${String(newNumber).padStart(6, '0')}`;
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
