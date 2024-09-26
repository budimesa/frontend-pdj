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

export const useBatchStore = defineStore('batch', {
    state: () => ({
        batches: [],
    }),
    actions: {
        async fetchBatches() {
            const response = await apiClient.get('/batches');
            this.batches = response.data.map(batch => ({
                ...batch,
                created_at: new Date(batch.created_at), // Mengonversi ke objek Date
                updated_at: new Date(batch.updated_at),
            }));
        },
        async createBatch(name, email, password) {
            await apiClient.post('/batches', { name, email, password });
            await this.fetchBatches(); // Refresh the batch list
        },
        async updateBatch(id, name, email) {
            await apiClient.put(`/batches/${id}`, { name, email });
            await this.fetchBatches(); // Refresh the batch list
        },
        async deleteBatch(id) {
            await apiClient.delete(`/batches/${id}`);
            await this.fetchBatches(); // Refresh the batch list
        },
    },
});
