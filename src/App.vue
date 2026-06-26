<template>
  <ConfirmDialog group="dialogconfirm"></ConfirmDialog>
  <Toast />
  <Header class="main-header" :back="route.name === 'forgot-password'" :simple="checkIfSimpleHeader()" />
  <div class="main-content" :class="{ 'flex-center': route.name === 'login', 'full-content': checkIfSimpleHeader() }">
    <router-view></router-view>
  </div>
  <Footer class="main-footer" />
</template>
<script setup>
import { useRoute } from 'vue-router'
import Footer from './components/Footer.vue';
import Header from './components/Header.vue';
import { useConfirm } from 'primevue/useconfirm';
import { ConfirmDialog } from 'primevue';
import { useToast } from 'primevue/usetoast';
import { toastInstanceInit } from './services/Toast';
import { dialogInstanceInit } from './services/Dialog';

const route = useRoute();

function checkIfSimpleHeader() {
  return route.name === 'login' || route.name === 'public' || route.name === 'register' || route.name === 'reset-password';
}

const confirm = useConfirm(); // Initialize confirm dialog
const toast = useToast(); // Initialize toast notifications
dialogInstanceInit(confirm); // Initialize dialog service
toastInstanceInit(toast); // Initialize toast service
</script>
<style scoped>
.main-content { height: 82%; overflow: auto; }
.main-footer {
  height: 10%;
  overflow: hidden;
}
.main-header {
  height: 8%;
}
.full-content { height: 90%; }

/* Tablet */
@media (min-width: 768px) {
  
}

/* Laptop / small desktop */
@media (min-width: 1024px) {
  .main-content { height: 87%; overflow: auto; }
  .main-footer { height: 5%; overflow: hidden; }
  .main-header { height: 8%; overflow: hidden; }
  .full-content { height: 95%; }
}

/* Large desktop */
@media (min-width: 1280px) {
}

/* Extra large desktop */
@media (min-width: 1536px) {

}
</style>