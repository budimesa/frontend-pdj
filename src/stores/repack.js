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

export const useRepackStore = defineStore('repack', {
    state: () => ({
        items: [],
        totalRecords: 0,
        rows: 10,
        first: 0,
        pagination: {
            total: 0,
            per_page: 10,
            current_page: 1,
            from: 1,
            last: 0,
            offset: 0,
        },
        repack: {},
        repacks: [],
        filteredProducts: [],
        selectedItem: null,
        formDialog: false,
        deleteDialog: false,
        isSaving: false,
        isDeleting: false,
    }),
    actions: {
        async fetchRepacks(page = 1, filters = {}) {
            try {                
                const per_page = this.rows
                const response = await apiClient.get('/repacks', {
                    params: { page, per_page, filters }
                });                
                this.items = response.data.data;
                this.pagination.total = response.data.total;
                this.pagination.per_page = response.data.per_page;
                this.pagination.current_page = response.data.current_page;
                this.pagination.from = response.data.from;
                this.pagination.last = response.data.last_page;
                this.pagination.offset = response.data.offset;
                this.totalRecords = response.data.total;
                this.first = (this.pagination.current_page - 1) * this.pagination.per_page;                
                
            } catch (error) {
                console.error('Error fetching repacks:', error);
            }
        },
        async createRetailRepack(retailRepack) {
            this.isSaving = true;
            try {                
                await apiClient.post('/repacks', retailRepack);
            } catch (error) {
                console.error('Error creating retail repack:', error);
                throw error; // Re-throw to handle in component if needed
            } finally {
                this.isSaving = false;
                this.formDialog = false; // Close dialog after save
            }
        },
        async deleteRepack(id) {
            await apiClient.delete(`/repacks/${id}`);
            await this.fetchRepacks(); // Refresh the Repack list
        },

        async fetchRepackDetailOptions() {
            const response = await apiClient.get('/repack-details');
            this.filteredProducts = response.data.data
            .filter(repackDetail => repackDetail.quantity > 0)
            .map(repackDetail => ({
                ...repackDetail
            }));
        }
    }
})