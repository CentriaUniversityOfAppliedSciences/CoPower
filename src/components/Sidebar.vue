<template>
  <aside class="sidebar">
    <div v-if="role === 'admin' || role === 'appadmin'" class="selection-button" @click="navigateTo('/admin/api')">
      <i class="pi pi-cloud-upload margin-right" />
      <span>{{ $t('pages.settings.api.title') }}</span>
    </div>
    <div v-if="role === 'admin'" class="selection-button" @click="navigateTo('/admin/organisation')">
      <i class="pi pi-building margin-right" />
      <span>{{ $t('pages.settings.organisation.title') }}</span>
    </div>
    <div v-if="role === 'appadmin'" class="selection-button" @click="navigateTo('/admin/organisations')">
      <i class="pi pi-building margin-right" />
      <span>{{ $t('pages.settings.organisations.title') }}</span>
    </div>
    <div class="selection-button" @click="navigateTo('/admin/users')">
      <i class="pi pi-user margin-right" />
      <span>{{ $t('pages.settings.users.title') }}</span>
    </div>
    <div class="selection-button" @click="navigateTo('/admin/sensors')">
      <i class="pi pi-cog margin-right" />
      <span>{{ $t('pages.settings.sensors.title') }}</span>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { StorageGet } from '../services/Storage';

const role = StorageGet('role');

const router = useRouter();
const navigateTo = (path) => { // Navigate to specified path
  router.push(path);
};
</script>

<style scoped>
.sidebar {
  width: 200px;
  height: 100%;
  background: #2c3e50;
  color: white;
  padding: 10px;
}
.selection-button {
  cursor: pointer;
  padding: 10px;
  transition: background 0.3s;
}
.selection-button:hover {
  background: #34495e;
}
ul {
  list-style: none;
  padding: 0;
}

@media (orientation: portrait) {
  .sidebar {
    display: flex;
    padding: 10px 20px;
  }
}

@media (orientation: landscape) {
  
}
</style>
