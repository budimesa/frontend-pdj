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

export const useCustomerStore = defineStore('customer', {
    state: () => ({
        customers: [],
    }),
    actions: {
        async fetchCustomers() {
            const response = await apiClient.get('/customers');
            this.customers = response.data.map(customer => ({
                ...customer,
                created_at: new Date(customer.created_at), // Mengonversi ke objek Date
                updated_at: new Date(customer.updated_at),
            }));
            return this.customers;
        },
        async createCustomer({customer_type, customer_code, customer_name, phone_number, address}) {
            await apiClient.post('/customers', { customer_type, customer_code, customer_name, phone_number, address });
            await this.fetchCustomers(); // Refresh the customer list
        },
        async updateCustomer({id, customer_type, customer_code, customer_name, phone_number, address}) {
            await apiClient.put(`/customers/${id}`, { customer_type, customer_code, customer_name, phone_number, address });
            await this.fetchCustomers(); // Refresh the customer list
        },
        async deleteCustomer(id) {
            await apiClient.delete(`/customers/${id}`);
            await this.fetchCustomers(); // Refresh the customer list
        },
    },
});
