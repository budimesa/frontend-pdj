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

export const useCustomerBalanceDepositStore = defineStore('customerBalanceDeposit', {
    state: () => ({
        balanceDeposit: [],
    }),
    actions: {
        // async fetchBalanceDeposits() {
        //     const response = await apiClient.get('/customer-balance-deposits');
        //     this.balanceDeposit = response.data.map(limit => ({
        //         ...limit,
        //         created_at: new Date(limit.created_at), // Mengonversi ke objek Date
        //         updated_at: new Date(limit.updated_at),
        //     }));
        //     return this.balanceDeposit;
        // },
        // async createBalanceDeposit({ customer_id, limit_amount, limit_used, limit_remaining, is_unlimited }) {
        //     await apiClient.post('/customer-balance-deposits', {
        //         customer_id,
        //         limit_amount,
        //         limit_used,
        //         limit_remaining,
        //         is_unlimited
        //     });
        //     await this.fetchBalanceDeposits(); // Refresh the credit limits list
        // },
        // async updateBalanceDeposit({ id, customer_id, limit_amount, limit_used, limit_remaining, is_unlimited }) {
        //     await apiClient.put(`/customer-balance-deposits/${id}`, {
        //         customer_id,
        //         limit_amount,
        //         limit_used,
        //         limit_remaining,
        //         is_unlimited
        //     });
        //     await this.fetchBalanceDeposits(); // Refresh the credit limits list
        // },
        // async deleteBalanceDeposit(id) {
        //     await apiClient.delete(`/customer-balance-deposits/${id}`);
        //     await this.fetchBalanceDeposits(); // Refresh the credit limits list
        // },
    },
});