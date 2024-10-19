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

export const useCustomerBalanceStore = defineStore('customerBalance', {
    state: () => ({
        balances: [],
        balanceDeposits: [],
    }),
    actions: {
        async fetchBalances(retries = 3) {
            try {
                const response = await apiClient.get('/customer-balances');
                this.balances = response.data.map(balance => ({
                    ...balance,
                    created_at: new Date(balance.created_at),
                    updated_at: new Date(balance.updated_at),
                }));
                return this.balances;
            } catch (error) {
                if (error.response && error.response.status === 500 && retries > 0) {
                    console.log(`Retrying... (${3 - retries + 1})`);
                    return this.fetchBalances(retries - 1);
                } else {
                    // Jika bukan error 500 atau sudah mencapai batas retry
                    throw error;
                }
            }
        },

        async fetchBalanceDeposits(retries = 3) {
            try {
                const response = await apiClient.get('/customer-balance-deposits');
                this.balanceDeposits = response.data.deposits.map(deposit => ({
                    ...deposit,
                    created_at: new Date(deposit.created_at),
                    updated_at: new Date(deposit.updated_at),
                }));
                return this.balanceDeposits;
            } catch (error) {
                if (error.response && error.response.status === 500 && retries > 0) {
                    console.log(`Retrying... (${3 - retries + 1})`);
                    return this.fetchBalanceDeposits(retries - 1);
                } else {
                    // Jika bukan error 500 atau sudah mencapai batas retry
                    throw error;
                }
            }
        },
        async createDeposit(balanceData) {
            this.isSaving = true;            
            try {                
                await apiClient.post('/customer-balances', balanceData);
            } catch (error) {
                console.error('Error creating customer balance:', error);
                throw error; // Re-throw to handle in component if needed
            } finally {
                this.isSaving = false;
                this.formDialog = false; // Close dialog after save
                await this.fetchBalanceDeposits();
            }
            
        },
        async updateDeposit(balanceData) {
            this.isSaving = true;            
            try {                
                await apiClient.put(`/customer-balances/${balanceData.id}`, balanceData);
            } catch (error) {
                console.error('Error creating customer balance:', error);
                throw error; // Re-throw to handle in component if needed
            } finally {
                this.isSaving = false;
                this.formDialog = false; // Close dialog after save
                await this.fetchBalanceDeposits(); // Refresh the balances list
            }
        },
        async deleteBalance(id) {
            await apiClient.delete(`/customer-balances/${id}`);
            await this.fetchBalanceDeposits(); // Refresh the balances list
        },
    },
});