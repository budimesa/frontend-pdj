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
    }),
    actions: {
        async fetchBalances() {
            const response = await apiClient.get('/customer-balances');
            this.balances = response.data.map(limit => ({
                ...limit,
                created_at: new Date(limit.created_at), // Mengonversi ke objek Date
                updated_at: new Date(limit.updated_at),
            }));
            return this.balances;
        },
        async createBalance(balanceData) {
            this.isSaving = true;            
            try {                
                await apiClient.post('/customer-balances', balanceData);
            } catch (error) {
                console.error('Error creating customer balance:', error);
                throw error; // Re-throw to handle in component if needed
            } finally {
                this.isSaving = false;
                this.formDialog = false; // Close dialog after save
                await this.fetchBalances();
            }
            
        },
        async updateBalance(balanceData) {
            this.isSaving = true;            
            try {                
                await apiClient.put(`/customer-balances/${id}`, balanceData);
            } catch (error) {
                console.error('Error creating customer balance:', error);
                throw error; // Re-throw to handle in component if needed
            } finally {
                this.isSaving = false;
                this.formDialog = false; // Close dialog after save
                await this.fetchBalances(); // Refresh the credit limits list
            }
        },
        async deleteBalance(id) {
            await apiClient.delete(`/customer-balances/${id}`);
            await this.fetchBalances(); // Refresh the credit limits list
        },
    },
});