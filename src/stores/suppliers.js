import axios from 'axios';
import { defineStore } from 'pinia';
const apiClient = axios.create({
    baseURL: 'http://localhost:8000/api/',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    withCredentials: true,
    withXSRFToken: true
});

export const useSupplierStore = defineStore('supplier', {
    state: () => ({
        suppliers: [],
    }),
    actions: {
        async fetchSuppliers() {
            const response = await apiClient.get('/suppliers');
            this.suppliers = response.data.map(supplier => ({
                ...supplier,
                created_at: new Date(supplier.created_at), // Mengonversi ke objek Date
                updated_at: new Date(supplier.updated_at),
            }));
        },
        async createSupplier(name, email, password) {
            await apiClient.post('/suppliers', { name, email, password });
            await this.fetchSuppliers(); // Refresh the supplier list
        },
        async updateSupplier(id, name, email) {
            await apiClient.put(`/suppliers/${id}`, { name, email });
            await this.fetchSuppliers(); // Refresh the supplier list
        },
        async deleteSupplier(id) {
            await apiClient.delete(`/suppliers/${id}`);
            await this.fetchSuppliers(); // Refresh the supplier list
        },
    },
});
