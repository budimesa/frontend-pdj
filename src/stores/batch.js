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
        regularBatch: [],
        nonRegularBatch: [],
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

        async createBatch({ batch_code, supplier_id, batch_code_type }) {
            try {
                await apiClient.post('/batches', { batch_code, supplier_id, batch_code_type });
            } catch (error) {
                console.error('Error creating batch:', error);
            }
        },

        async fetchRegularBatch(supplierId) {
            try {
                const response = await apiClient.get(`/batches/regular/${supplierId}`);
                this.regularBatch = response.data.map(batch => ({
                    ...batch,
                    created_at: new Date(batch.created_at),
                    updated_at: new Date(batch.updated_at),
                }));
            } catch (error) {
                console.error('Error fetching regular batches:', error);
            }
        },

        async fetchNonRegularBatch() {
            const response = await apiClient.get('/batches-non-regular');
            this.nonRegularBatch = response.data
        },
    },
});
