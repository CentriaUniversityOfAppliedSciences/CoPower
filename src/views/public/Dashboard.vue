<template>
  <div class="dashboard-main-container relative size100">
    <div class="dashboard-main-content" :class="['size100', { 'flex-center': loading === true }]">
      <Loader v-if="loading === true" text="general.dashboardLoad" />
      <Button v-if="ready === true" class="button-margin" @click="goToLogin()" type="button" :label="$t('pages.public.backToLogin')" />
      <DashboardView v-if="ready === true && dashboardState !== ''" :dashboard="dashboardState" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Button } from 'primevue';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { StorageGet, StorageSet } from '../../services/Storage';
import Loader from '../../components/Loader.vue';
import { AppSettings } from '../../services/Settings';
import axios from 'axios';
import { GetURLHeader } from '../../services/Utils';
import DashboardView from './DashboardView.vue';

const { t } = useI18n();
const router = useRouter();

const dashboardState = ref(''); // Dashboard state
const loading = ref(false); // Loading state
const ready = ref(false); // Ready state

onMounted(() => {
  changeDashboard('public');
});

/**
 * Change the active dashboard
 * @param selectedValue The selected dashboard value
 */
const changeDashboard = async (selectedValue: 'public'): Promise<void> => {
  const dashboard = await StorageGet('dashboard' + selectedValue.charAt(0).toUpperCase() + selectedValue.slice(1));
  if (dashboard) {
    const currentTime = new Date().getTime() / 1000; // Current time in seconds
    const timeDifference = currentTime - dashboard.ts; // Time difference in seconds
    if (timeDifference > AppSettings.dashboardUpdateInterval) {
      loadDashboard(selectedValue);
    } else {
      loading.value = false;
      ready.value = true;
      dashboardState.value = selectedValue;
    }
  } else {
    dashboardState.value = selectedValue;
    loadDashboard(selectedValue);
  }
};

/**
 * Navigate to the login page
 */
const goToLogin = (): void => {
  router.push('/');
}

/**
 * Load the dashboard data from the API
 * @param dashboard The dashboard to load
 */
const loadDashboard = async (dashboard: 'public') => {
  loading.value = true;
  const apiUrl = `${AppSettings.env.API_URL}/dashboard/get/${dashboard}`;
  axios
    .get(apiUrl, {
      headers: GetURLHeader()
    })
    .then((response) => {
      StorageSet('dashboard' + dashboard.charAt(0).toUpperCase() + dashboard.slice(1), { ts: new Date().getTime() / 1000, data: response.data });
      StorageSet('dashboardSelect', dashboard);
      ready.value = true;
    })
    .catch((error) => {}).finally(() => {
      loading.value = false;
    });
  
};
</script>
<style scoped>
.button-margin {
  margin-left: 10px;
  margin-top: 10px;
}

.sensor-chart-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.sensor-chart-container > * {
  flex-basis: calc(50% - 8px);
  box-sizing: border-box;
}

.btn {
  margin-right: 0.5em;
  padding: 10px 20px;
  border: 1px solid #0e6c17;
  background-color: #0e6c17;
  cursor: pointer;
  color: var(--color-black-always);
  transition: background-color 0.3s;
}
.btn-active {
  background-color: #4abc67;
  color: white;
  border-color: #00b31b;
}
.btn:hover:not(.btn-active) {
  background-color: #4abc67;
  border-color: #00b31b;
}

.content { flex: 1; }

select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  color: black;
  font-size: 16px;
  background: white;
  cursor: pointer;
}

select:focus {
  outline: none;
  border-color: #007bff;
}
</style>
