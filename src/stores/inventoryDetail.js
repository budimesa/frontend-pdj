import axios from 'axios';
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

export const useInventoryDetailStore = defineStore('inventoryDetail', {
    state: () => ({
        // inventoryDetails: [],
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
        inventoryDetail: {},        
        inventoryDetails: [],
        filteredProducts: [],
        selectedItem: null,
        formDialog: false,
        deleteDialog: false,
        isSaving: false,
        isDeleting: false,
    }),
    actions: {
        async fetchInventoryDetailOptions(fromWarehouseId) {
            const response = await apiClient.get('/inventory-details', {
                params: {
                    from_warehouse_id: fromWarehouseId
                }
            });
            this.filteredProducts = response.data.data
            .filter(inventoryDetail => inventoryDetail.actual_stock > 0)
            .map(inventoryDetail => ({
                ...inventoryDetail
            }));
        }
    },
});