import '@/assets/styles.scss';
import '@/assets/tailwind.css';
import { formatIDR, formatThousand } from '@/utils/format';
import Aura from '@primevue/themes/aura';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { createApp } from 'vue';
import 'vue-multiselect/dist/vue-multiselect.css';
import App from './App.vue';
import router from './router';

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(pinia);
app.use(ToastService);
app.use(ConfirmationService);
app.config.globalProperties.$formatIDR = formatIDR;
app.config.globalProperties.$formatThousand = formatThousand;

app.mount('#app');
