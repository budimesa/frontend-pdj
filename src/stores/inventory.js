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

export const useInventoryStore = defineStore('inventory', {
    state: () => ({
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
        inventory: {},
        inventories: [],
        filteredProducts: [],
        selectedItem: null,
        formDialog: false,
        deleteDialog: false,
        isSaving: false,
        isDeleting: false,
    }),
    actions: {
        async fetchInventories(page = 1, filters = {}) {
            try {                
                const per_page = this.rows
                const response = await apiClient.get('/inventories', {
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
                console.error('Error fetching inventories:', error);
            }
        },
        async deleteInventory(id) {
            await apiClient.delete(`/inventories/${id}`);
            await this.fetchInventories(); // Refresh the inventory list
        },

        async fetchInventoryDetailOptions(fromWarehouseId = 1) {
            const response = await apiClient.get('/inventory-details', {
                params: {
                    from_warehouse_id: fromWarehouseId
                }
            });
            this.filteredProducts = response.data.data
            .filter(inventoryDetail => inventoryDetail.quantity > 0)
            .map(inventoryDetail => ({
                ...inventoryDetail
            }));
        }
    }
})