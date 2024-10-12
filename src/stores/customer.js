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

// Utility function for date conversion
const convertToDate = (customer) => ({
    ...customer,
    created_at: new Date(customer.created_at),
    updated_at: new Date(customer.updated_at),
});

export const useCustomerStore = defineStore('customer', {
    state: () => ({
        customers: [],
        regularCustomers: [],
        formData: { customer_type: 'regular', customer_name: '', phone_number: '', address: '' },
    }),
    actions: {
        async fetchCustomers(retries = 3) {
            try {
                const response = await apiClient.get('/customers');
                this.customers = response.data.map(convertToDate);
            } catch (error) {
                if (error.response && error.response.status === 500 && retries > 0) {
                    console.log(`Retrying... (${3 - retries + 1})`);
                    return this.fetchCustomers(retries - 1);
                } else {
                    // Jika bukan error 500 atau sudah mencapai batas retry
                    throw error;
                }
            }
        },
        async fetchRegularCustomers() {
            try {
                const response = await apiClient.get('/customers');
                this.regularCustomers = response.data
                    .filter(customer => customer.customer_type === 'regular')
                    .map(convertToDate);
            } catch (error) {
                console.error('Failed to fetch regular customers:', error);
            }
        },
        async createCustomer(data) {
            try {
                const response = await apiClient.post('/customers', data);
                this.customers.push(convertToDate(response.data)); // Update state locally
            } catch (error) {
                console.error('Failed to create customer:', error);
            }
        },
        async updateCustomer(data) {
            try {
                const response = await apiClient.put(`/customers/${data.id}`, data);
                const index = this.customers.findIndex(customer => customer.id === data.id);
                if (index !== -1) {
                    this.customers[index] = convertToDate(response.data); // Update state locally
                }
            } catch (error) {
                console.error('Failed to update customer:', error);
            }
        },
        async deleteCustomer(id) {
            try {
                await apiClient.delete(`/customers/${id}`);
                this.customers = this.customers.filter(customer => customer.id !== id); // Update state locally
            } catch (error) {
                console.error('Failed to delete customer:', error);
            }
        },
    },
});
