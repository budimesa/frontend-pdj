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
        newItemIncomingCode: '',
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
        incomingItem: {},
        incomingItems: [],
        incomingItemDetails: [],
        selectedItem: null,
        formDialog: false,
        deleteDialog: false,
        isSaving: false,
        isDeleting: false,
    }),
    actions: {
        async fetchIncomingItems(page = 1, filters = {}) {
            try {                
                const per_page = this.rows
                const response = await apiClient.get('/incoming-items', {
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
                console.error('Error fetching incoming items:', error);
            }
        },
        async fetchIncomingItem(id) {
            try {                
                const response = await apiClient.get(`/incoming-items/${id}`);                   
                this.incomingItem = response.data.incoming_item;
                this.incomingItemDetails = response.data.details;
            } catch (error) {
                console.error('Error fetching incoming item:', error);
            }
        },
        async fetchLastRow() {         
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
        async updateIncomingItem(incomingItem) {
            this.isSaving = true;            
            try {                
                await apiClient.put(`/incoming-items/${incomingItem.id}`, incomingItem);
            } catch (error) {
                console.error('Error creating incoming item:', error);
                throw error; // Re-throw to handle in component if needed
            } finally {
                this.isSaving = false;
                this.formDialog = false; // Close dialog after save
            }
        },
        async deleteIncomingItem(id) {
            await apiClient.delete(`/incoming-items/${id}`);
            await this.fetchIncomingItems(); // Refresh the item list
        },
    },
});
