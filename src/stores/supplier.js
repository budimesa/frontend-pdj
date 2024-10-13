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

export const useSupplierStore = defineStore('supplier', {
    state: () => ({
        suppliers: [],
        supplierOptions: [],
    }),
    actions: {
        async fetchSuppliers() {
            const response = await apiClient.get('/suppliers');
            this.suppliers = response.data.map(supplier => ({
                ...supplier,
                created_at: new Date(supplier.created_at), // Mengonversi ke objek Date
                updated_at: new Date(supplier.updated_at),
            }));
            return this.suppliers;
        },
        async createSupplier({supplier_type, supplier_code, supplier_name, phone_number, address}) {
            await apiClient.post('/suppliers', { supplier_type, supplier_code, supplier_name, phone_number, address });
            await this.fetchSuppliers(); // Refresh the supplier list
        },
        async updateSupplier({id, supplier_type, supplier_code, supplier_name, phone_number, address}) {
            await apiClient.put(`/suppliers/${id}`, { supplier_type, supplier_code, supplier_name, phone_number, address });
            await this.fetchSuppliers(); // Refresh the supplier list
        },
        async deleteSupplier(id) {
            await apiClient.delete(`/suppliers/${id}`);
            await this.fetchSuppliers(); // Refresh the supplier list
        },
        async fetchSupplierOptions() {
            await this.fetchSuppliers();
            this.supplierOptions = this.suppliers.map(supplier => ({
                label: supplier.supplier_name,
                value: supplier.id
            }))
        }
    },
});
