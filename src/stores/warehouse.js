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

export const useWarehouseStore = defineStore('warehouse', {
    state: () => ({
        warehouses: [],
        warehouseOptions: [],
    }),
    actions: {
        async fetchWarehouses() {
            const response = await apiClient.get('/warehouses');
            this.warehouses = response.data.map(warehouse => ({
                ...warehouse,
                created_at: new Date(warehouse.created_at), // Mengonversi ke objek Date
                updated_at: new Date(warehouse.updated_at),
            }));
            return this.warehouses;
        },
        async createWarehouse({warehouse_code, warehouse_name, location}) {
            await apiClient.post('/warehouses', { warehouse_code, warehouse_name, location});
            await this.fetchWarehouses(); // Refresh the warehouse list
        },
        async updateWarehouse({id, warehouse_code, warehouse_name, location}) {
            await apiClient.put(`/warehouses/${id}`, { warehouse_code, warehouse_name, location});
            await this.fetchWarehouses(); // Refresh the warehouse list
        },
        async deleteWarehouse(id) {
            await apiClient.delete(`/warehouses/${id}`);
            await this.fetchWarehouses(); // Refresh the warehouse list
        },
        async fetchWarehouseOptions() {
            await this.fetchWarehouses();
            this.warehouseOptions = this.warehouses.map(warehouse => ({
                label: warehouse.warehouse_name,
                value: warehouse.id
            }))
        }
    },
});
