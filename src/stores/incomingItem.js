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
        newItemIncomingCode: '',
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
            // const response = await apiClient.get('incoming-item-last-row');            
            try {
                const response = await apiClient.get('incoming-item-last-row');
                if (response.data) {
                    return response.data;
                } else {                    
                    return null;
                }
            } catch (error) {
                console.error("Terjadi kesalahan saat mengambil data:", error);
                throw error; // Opsional, bisa juga mengembalikan nilai default
            }
        },
        async generateNewIncomingItemCode() {
          const lastItemCode = await this.fetchLastRow();                 
          if (!lastItemCode) {
            return this.newItemIncomingCode  = 'BM000001';
          }
          const prefix = lastItemCode.incoming_item_code.slice(0, 2); // Misal 'BM'
          const lastNumber = parseInt(lastItemCode.incoming_item_code.slice(2), 10); // Ambil angka
          const newNumber = lastNumber + 1;
          return this.newItemIncomingCode = `${prefix}${String(newNumber).padStart(6, '0')}`;
        },
        // async createIncomingItem({incoming_item_code, supplier_id, warehouse_id, shipment_date, received_date, total_item_price, shipping_cost, labor_cost, other_fee, total_cost, notes, invoice_files}) {
        //     await apiClient.post('/incoming-items', { incoming_item_code, supplier_id, warehouse_id, shipment_date, received_date, total_item_price, shipping_cost, labor_cost, other_fee, total_cost, notes, invoice_files});
        //     await this.fetchIncomingItems(); // Refresh the item list
        // },
        async createIncomingItem(incomingItem) {
            this.isSaving = true;            
            try {                
                await apiClient.post('/incoming-items', incomingItem);
            } catch (error) {
                console.error('Error creating incoming item:', error);
                throw error; // Re-throw to handle in component if needed
            } finally {
                this.isSaving = false;
                this.formDialog = false; // Close dialog after save
            }
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
