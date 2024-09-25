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

export const useItemStore = defineStore('item', {
    state: () => ({
        items: [],
    }),
    actions: {
        async fetchItems() {
            const response = await apiClient.get('/items');
            this.items = response.data.map(item => ({
                ...item,
                created_at: new Date(item.created_at), // Mengonversi ke objek Date
                updated_at: new Date(item.updated_at),
            }));
            return this.items;
        },
        async createItem({item_code, item_name, item_description}) {
            await apiClient.post('/items', { item_code, item_name, item_description});
            await this.fetchItems(); // Refresh the item list
        },
        async updateItem({id, item_code, item_name, item_description}) {
            await apiClient.put(`/items/${id}`, { item_code, item_name, item_description});
            await this.fetchItems(); // Refresh the item list
        },
        async deleteItem(id) {
            await apiClient.delete(`/items/${id}`);
            await this.fetchItems(); // Refresh the item list
        },
    },
});
