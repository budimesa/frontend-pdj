import axios from 'axios';
import { defineStore } from 'pinia';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    withCredentials: true,
    withXSRFToken: true
});

export const useBomFormulaStore = defineStore('bomFormula', {
    state: () => ({
        // bomFormulas: [],
        // bomFormula: {}
        formulas: [],
        items: [],
        mergedResults: [],
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
        bomFormula: {},
        bomFormulaDetails: [],
        selectedItem: null,
        formDialog: false,
        deleteDialog: false,
        isSaving: false,
        isDeleting: false,
    }),
    actions: {
        async fetchBomFormulas(page = 1, filters = {}) {
            try {                
                const per_page = this.rows
                const response = await apiClient.get('/bom-formulas', {
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
                console.error('Error fetching bom formulas:', error);
            }
        },

        async fetchBomFormula(id) {
            try {                
                const response = await apiClient.get(`/bom-formulas/${id}`);                   
                this.bomFormula = response.data.bom_formula;
                this.bomFormulaDetails = response.data.details;
            } catch (error) {
                console.error('Error fetching bom formula:', error);
            }
        },
        
        async createBomFormula(bomFormula) {
            this.isSaving = true;            
            try {                
                await apiClient.post('/bom-formulas', bomFormula);
            } catch (error) {
                console.error('Error creating bom formula:', error);
                throw error; // Re-throw to handle in component if needed
            } finally {
                this.isSaving = false;
                this.formDialog = false; // Close dialog after save
            }
        },

        async updateBomFormula(bomFormula) {
            this.isSaving = true;
            try {
                await apiClient.put(`/bom-formulas/${bomFormula.id}`, bomFormula);
            } catch (error) {
                console.error('Error updating bom formula:', error);
                throw error; // Re-throw to handle in component if needed
            } finally {
                this.isSaving = false;
                this.formDialog = false; // Close dialog after save
            }
        },

        async deleteBomFormula(id) {
            try {
                await apiClient.delete(`/bom-formulas/${id}`);
                await this.fetchBomFormulas();
            } catch (error) {
                console.error('Error deleting bom formula:', error);
                throw error; // Re-throw to handle in component if needed
            } finally {
                this.isDeleting = false;
                this.deleteDialog = false; // Close dialog after delete
            }
        },

        async fetchMergeRawMaterialAndWIP() {            
            const response = await apiClient.get('/fetch-merged-raw-wfg');
            this.mergedResults = response.data.map(mergedResult => ({
                ...mergedResult
            }));
        }, 

        async updateBomFormula(bomFormula) {
            this.isSaving = true;
            try {
                await apiClient.put(`/bom-formulas/${bomFormula.id}`, bomFormula);
            } catch (error) {
                console.error('Error updating bom formula:', error);
                throw error; // Re-throw to handle in component if needed
            } finally {
                this.isSaving = false;
                this.formDialog = false; // Close dialog after save
            }
        },

        async fetchItemPropsByItemCode(itemCode) {                     
            const response = await apiClient.get(`/show-merged-raw-wfg/${itemCode}`);
            return response.data;  
        },        
        
        setSelectedItem(item) {
            this.selectedItem = item;
        },

        clearSelectedItem() {
            this.selectedItem = null;
        },
    }
})