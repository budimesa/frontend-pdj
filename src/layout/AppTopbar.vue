<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="onMenuToggle">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <span>PD Jaya</span>
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div>
            </div>

            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action" @click="openModalChangePassword" >
                            <i class="pi pi-lock"></i>
                            <span>Change Password</span>
                    </button>                
                    <button type="button" class="layout-topbar-action" @click="handleLogout">
                        <i class="pi pi-sign-out"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <Dialog v-model:visible="formDialog" modal header="Change Password" :style="{ width: '40rem' }">
            <span class="text-surface-500 dark:text-surface-400 block mb-8">Update your password.</span>
            
            <div class="mb-4">
                <label for="currentPassword" class="font-semibold block mb-2">Current Password</label>
                <InputText id="currentPassword" type="password" v-model="currentPassword" class="w-full" autocomplete="off" required />
                <small v-if="submitted && !currentPassword" class="text-red-500">Current Password wajib diisi.</small>
                <small v-if="submitted && currentPasswordError" class="text-red-500">{{ currentPasswordError }}</small>
            </div>
            
            <div class="mb-4">
                <label for="newPassword" class="font-semibold block mb-2">New Password</label>
                <InputText id="newPassword" type="password" v-model="newPassword" class="w-full" autocomplete="off" required />
                <small v-if="submitted && !newPassword" class="text-red-500">New Password wajib diisi.</small>
            </div>
            
            <div class="mb-8">
                <label for="confirmNewPassword" class="font-semibold block mb-2">Confirm New Password</label>
                <InputText id="confirmNewPassword" type="password" v-model="confirmNewPassword" class="w-full" autocomplete="off" required />
                <small v-if="submitted && !confirmNewPassword" class="text-red-500">Confirm New Password wajib diisi.</small>
                <small v-if="submitted && newPassword !== confirmNewPassword" class="text-red-500">New password and confirm password do not match.</small>
            </div>
            
            <div class="flex justify-end gap-2">
                <Button type="button" label="Cancel" severity="secondary" @click="hideDialog"></Button>
                <Button type="button" label="Save" @click="changePassword"></Button>
            </div>
        </Dialog>

</template>
<script setup>
import { useLayout } from '@/layout/composables/layout';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AppConfigurator from './AppConfigurator.vue';

const { onMenuToggle, toggleDarkMode, isDarkTheme } = useLayout();
const router = useRouter()
const authStore = useAuthStore();
const overlay = ref(null);
const currentPassword = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');
const submitted = ref(false);
const formDialog = ref(false);
const currentPasswordError = ref(''); 
const toast = useToast();
const toggleMenu = (event) => {
  overlay.value.toggle(event);
};
const openModalChangePassword = () => {
    currentPassword.value = '';
    newPassword.value = '';
    confirmNewPassword.value = '';
    submitted.value = false;
    formDialog.value = true;
};

const hideDialog = () => {
  formDialog.value = false;
  submitted.value = false;
};
const changePassword = async () => {
    submitted.value = true;
    if(currentPassword.value && newPassword.value && confirmNewPassword.value ) {
        currentPasswordError.value = ''; // Reset error message

        if (!currentPassword.value) {
            return; // Validasi currentPassword
        }
        if (newPassword.value !== confirmNewPassword.value) {
            return;
        }
        try {
            await authStore.changePassword(currentPassword.value, newPassword.value);
            toast.add({ severity: 'success', summary: 'Success', detail: 'Password updated successfully', life: 3000 });
            hideDialog();
        } catch (error) {
            if (error.response && error.response.status === 403) {
                currentPasswordError.value = 'Current password is incorrect.'; // Set pesan kesalahan jika password salah
            } else {
                console.error('Failed to change password', error);
            }
        }

    }
};

const handleLogout = async () => {
    await authStore.logout();
    router.push('/login'); // Redirect to login page after logout
};
</script>
<style>
.p-popover:after, .p-popover:before {
    left: 10.25rem !important;
}
</style>