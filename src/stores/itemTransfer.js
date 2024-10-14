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

export const useItemTransferStore = defineStore('itemTransfer', {
    state: () => ({
        newTransferCode: '',
        items: [],
        mergedResults: [],
        totalRecords: 0,
        rows: 10,
        first: 0,
        pagination: {
            total: 0,
            per_page: 10,
            current_page: 1,
            from: 1,
            last: 0,
            offset: 0,
        },
        itemTransfer: {},
        itemTransfers: [],
        itemTransferDetails: [],
        selectedItem: null,
        formDialog: false,
        deleteDialog: false,
        isSaving: false,
        isDeleting: false,
    }),
    actions: {
        async fetchItemTransfers(page = 1, filters = {}) {
            try {                
                const per_page = this.rows
                const response = await apiClient.get('/item-transfers', {
                    params: { page, per_page, filters }
                });                
                this.items = response.data.data;
                this.pagination.total = response.data.total;
                this.pagination.per_page = response.data.per_page;
                this.pagination.current_page = response.data.current_page;
                this.pagination.from = response.data.from;
                this.pagination.last = response.data.last_page;
                this.pagination.offset = response.data.offset;
                this.totalRecords = response.data.total;
                this.first = (this.pagination.current_page - 1) * this.pagination.per_page;                
                
            } catch (error) {
                console.error('Error fetching item tranfers:', error);
            }
        },
        async fetchItemTransfer(id) {
            try {                
                const response = await apiClient.get(`/item-transfers/${id}`);                   
                this.itemTransfer = response.data.item_transfer;
                this.itemTransferDetails = response.data.details;
            } catch (error) {
                console.error('Error fetching item transfer:', error);
            }
        },
        async fetchLastRow() {         
            try {
                const response = await apiClient.get('item-transfer-last-row');
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
        async generateNewTransferCode() {
          const lastTransferCode = await this.fetchLastRow();                 
          if (!lastTransferCode) {
            return this.newTransferCode  = 'TF000001';
          }
          const prefix = lastTransferCode.transfer_code.slice(0, 2);
          const lastNumber = parseInt(lastTransferCode.transfer_code.slice(2), 10); // Ambil angka
          const newNumber = lastNumber + 1;
          return this.newTransferCode = `${prefix}${String(newNumber).padStart(6, '0')}`;
        },
       
        async createItemTransfer(itemTransfer) {
            this.isSaving = true;
            try {                
                await apiClient.post('/item-transfers', itemTransfer);
            } catch (error) {
                console.error('Error creating item transfer:', error);
                throw error; // Re-throw to handle in component if needed
            } finally {
                this.isSaving = false;
                this.formDialog = false; // Close dialog after save
            }
        },
        async updateItemTransfer(itemTransfer) {            
            this.isSaving = true;            
            try {                
                await apiClient.put(`/item-transfers/${itemTransfer.id}`, itemTransfer);
            } catch (error) {
                console.error('Error creating item transfer:', error);
                throw error; // Re-throw to handle in component if needed
            } finally {
                this.isSaving = false;
                this.formDialog = false; // Close dialog after save
            }
        },
        async deleteItemTransfer(id) {
            await apiClient.delete(`/item-transfers/${id}`);
            await this.fetchItemTransfers(); // Refresh the item list
        },
    },
});
