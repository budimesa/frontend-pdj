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

export const useCustomerCreditLimitStore = defineStore('customerCreditLimit', {
    state: () => ({
        creditLimits: [],
    }),
    actions: {
        async fetchCreditLimits() {
            const response = await apiClient.get('/customer-credit-limits');
            this.creditLimits = response.data.map(limit => ({
                ...limit,
                created_at: new Date(limit.created_at), // Mengonversi ke objek Date
                updated_at: new Date(limit.updated_at),
            }));
            return this.creditLimits;
        },
        async createCreditLimit({ customer_id, limit_amount, limit_used, limit_remaining, is_unlimited }) {
            await apiClient.post('/customer-credit-limits', {
                customer_id,
                limit_amount,
                limit_used,
                limit_remaining,
                is_unlimited
            });
            await this.fetchCreditLimits(); // Refresh the credit limits list
        },
        async updateCreditLimit({ id, limit_amount, limit_used, limit_remaining, is_unlimited }) {
            await apiClient.put(`/customer-credit-limits/${id}`, {
                limit_amount,
                limit_used,
                limit_remaining,
                is_unlimited
            });
            await this.fetchCreditLimits(); // Refresh the credit limits list
        },
        async deleteCreditLimit(id) {
            await apiClient.delete(`/customer-credit-limits/${id}`);
            await this.fetchCreditLimits(); // Refresh the credit limits list
        },
    },
});
