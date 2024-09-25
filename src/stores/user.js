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

export const useUserStore = defineStore('user', {
    state: () => ({
        users: [],
    }),
    actions: {
        async fetchUsers() {
            const response = await apiClient.get('/users');
            this.users = response.data.map(user => ({
                ...user,
                created_at: new Date(user.created_at), // Mengonversi ke objek Date
                updated_at: new Date(user.updated_at),
            }));
        },
        async createUser(name, email, password) {
            await apiClient.post('/users', { name, email, password });
            await this.fetchUsers(); // Refresh the user list
        },
        async updateUser(id, name, email) {
            await apiClient.put(`/users/${id}`, { name, email });
            await this.fetchUsers(); // Refresh the user list
        },
        async deleteUser(id) {
            await apiClient.delete(`/users/${id}`);
            await this.fetchUsers(); // Refresh the user list
        },
    },
});
