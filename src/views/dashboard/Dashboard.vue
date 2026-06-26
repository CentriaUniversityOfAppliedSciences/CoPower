<template>
  <div class="dashboard-main-container relative size100">
    <div class="dashboard-main-content" :class="['size100', { 'flex-center': loading === true }]">
      <Loader v-if="loading === true" text="general.dashboardLoad" />
      <div class="flex-center size100" v-else-if="dashboardState === ''">
        {{ $t('pages.dashboard.select') }}
      </div>
      <DashboardView v-if="ready === true && dashboardState !== ''" :dashboard="dashboardState" />
    </div>
    <div class="dashboard-main-selector flex-center">
      <FloatLabel class="w-full md:w-56 selectable" variant="on">
        <Select v-model="dashboardState" inputId="dashboard_select" :options="dashboardStateOptions" optionLabel="label" optionValue="value" class="w-full md:w-56" @update:modelValue="changeDashboard" />
        <label for="dashboard_select">{{ $t('general.dashboard') }}</label>
      </FloatLabel>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { FloatLabel, Select } from 'primevue';
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
const dashboardStateOptions = ref([ // Dashboard state options
  { label: t('general.default'), value: 'default' },
  { label: t('general.user'), value: 'user' },
]);
const loading = ref(false); // Loading state
const ready = ref(false); // Ready state

onMounted(() => {
  const userRole = StorageGet('role');
  if (userRole === 'appadmin') { // If user is appadmin, add 'public' dashboard option
    dashboardStateOptions.value.splice(1, 0, { label: t('general.public'), value: 'public' });
  }

  const dashboardSelect = StorageGet('dashboardSelect');
  if (dashboardSelect) { // If a dashboard is selected, set it as the current state
    dashboardState.value = dashboardSelect;
    changeDashboard(dashboardSelect);
  } else { // Default to 'default' dashboard if no selection is made
    dashboardState.value = 'default';
    changeDashboard('default');
  }
});

/**
 * Change the active dashboard
 * @param selectedValue The selected dashboard value
 */
const changeDashboard = async (selectedValue: 'default' | 'user' | 'public'): Promise<void> => {
  const dashboard = await StorageGet('dashboard' + selectedValue.charAt(0).toUpperCase() + selectedValue.slice(1));
  if (dashboard) {
    const dashboardUpdate = StorageGet('dashboardUpdate');
    const currentTime = new Date().getTime() / 1000; // Current time in seconds
    const timeDifference = currentTime - dashboard.ts; // Time difference in seconds
    if ((timeDifference > AppSettings.dashboardUpdateInterval) || (dashboardUpdate === true)) {
      await loadDashboard(selectedValue);
    } else {
      StorageSet('dashboardSelect', selectedValue);
      loading.value = false;
      ready.value = true;
    }
  } else {
    await loadDashboard(selectedValue);
  }
};

/**
 * Load the specified dashboard
 * @param dashboard The dashboard to load
 */
const loadDashboard = async (dashboard: 'default' | 'user' | 'public') => {
  loading.value = true;
  const apiUrl = `${AppSettings.env.API_URL}/dashboard/get/${dashboard}`;
  axios
    .get(apiUrl, {
      headers: GetURLHeader()
    })
    .then((response) => {
      StorageSet('dashboardUpdate', false);
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
.content { flex: 1; }

.dashboard-main-selector {
  pointer-events: none;
  position: absolute;
}

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
