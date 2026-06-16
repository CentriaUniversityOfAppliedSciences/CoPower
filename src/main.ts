import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import router from './router/index.ts';
import './style.css';
import App from './App.vue';
import { i18n } from './services/i18n.ts';

import Button from 'primevue/button';
import DatePicker from 'primevue/datepicker';
import { darkModeInit, languageInit } from './services/Settings.ts';

import { en } from 'primelocale/js/en.js';

darkModeInit();
languageInit();

const app = createApp(App);

import ConfirmationService from 'primevue/confirmationservice';
import { Toast, ToastService } from 'primevue';

app.component('Button', Button);
app.component('DatePicker', DatePicker);
app
  .use(router) // Use the router
  .use(i18n) // Use the i18n for internationalization
  .use(ConfirmationService) // Use the confirmation service
  .component('Toast', Toast) // Register Toast component
  .use(ToastService) // Use the toast service
  .use(PrimeVue, { // PrimeVue configuration
    theme: {
      locale: en,
      options: {
        darkModeSelector: '.app-dark-mode'
      },
      preset: Aura
    },
  })
  .mount('#app');
;