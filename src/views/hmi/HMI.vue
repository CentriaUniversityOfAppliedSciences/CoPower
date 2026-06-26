<template>
  <div class="hmi-main-container relative size100">
    <div class="hmi-main-content">
      <Loader v-if="pageStatus === 0" text="pages.hmi.dashboardLoad" :absolute="true" />
      <ErrorRetry v-else-if="pageStatus === 2" message="pages.hmi.dashboardLoadError" :absolute="true" @reload="loadDashboard" />
      <div v-else class="hmi-dashboard-container flex flex-col flex-align-center">
        <div v-for="(item, index) in dashboardData" :key="index" class="hmi-dashboard-item">
          <div class="divider"></div>
          <div class="flex-center">
            <span class="text-larger2 font-bold">
              {{ $t('pages.hmi.sections.' + item.name) }}
            </span>
          </div>
          <div class="flex-center">
            <i v-if="lastDataUpdate[item.name].outdated === true" class="pi pi-exclamation-triangle margin-right animation-yellow-flashing"></i>
            <span>{{ (lastDataUpdate[item.name].last === 'unknown' ? $t('general.unknown') : lastDataUpdate[item.name].last) }}</span>
            <i v-if="lastDataUpdate[item.name].outdated === true" class="pi pi-exclamation-triangle margin-left animation-yellow-flashing"></i>
          </div>
          <div class="divider"></div>
          <div v-for="(sensor, sindex) in item.sensors" :key="sindex" class="flex element-margin hmi-dashboard-sensor">
            <div v-for="(sensor2, sindex2) in sensor" :key="sindex2" class="flex-1 flex-center">
              <div v-if="sensor2.elementType === 'output'" class="value-output">
                <label :for="'output' + sensor2.id" class="font-bold text-center block mb-2">{{ $t('pages.hmi.values.' + sensor2.name) }}</label>
                <InputNumber v-model="dataValues[sensor2.id]" :maxFractionDigits="1" :minFractionDigits="1" :inputId="'output' + sensor2.id" :suffix="' ' + sensor2.unit" fluid :pt="{ pcInputText: { root: 'text-center' } }" />
              </div>
              <div v-else-if="sensor2.elementType === 'title'" class="text-larger1">
                {{ $t('pages.hmi.sensors.' + sensor2.name) }}
              </div>
              <div v-else-if="sensor2.elementType === 'span'" class="text-larger0">
                <span>{{ $t('pages.hmi.sensors.' + sensor2.name) }}</span>
              </div>
              <div v-else-if="sensor2.elementType === 'empty'"></div>
              <div v-else>
                <div class="hmi-soutput value-output">
                  {{ $t(getBessStatus(dataValues[sensor2.id])) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { AppSettings } from '../../services/Settings';
import axios from 'axios';
import { InputNumber } from 'primevue';
import { GetURLHeader } from '../../services/Utils';
import { StorageGet, StorageSet } from '../../services/Storage';
import ErrorRetry from '../../components/ErrorRetry.vue';
import Loader from '../../components/Loader.vue';
import { DashboardHMI } from '../../services/Interfaces';

const dashboardData = ref<DashboardHMI[]>([]); // Dashboard data
const dataValues: any = ref({}); // Sensor values
const lastDataUpdate: any = ref({}); // Timestamp of last data update for each sensor
const pageStatus = ref(0); // Page status (0: loading, 1: loaded, 2: error)

onMounted(() => {
  changeDashboard();
});

/**
 * Check if dashboard data is available in storage and if it's still valid, otherwise load it from the API
 */
const changeDashboard = async (): Promise<void> => {
  const dashboard = await StorageGet('dashboardHMI');
  if (dashboard) {
    const currentTime = new Date().getTime() / 1000; // Current time in seconds
    const timeDifference = currentTime - dashboard.ts; // Time difference in seconds
    if (timeDifference > AppSettings.dashboardUpdateInterval) {
      loadDashboard();
    } else {
      processDashboard(dashboard.data);
      pageStatus.value = 1;
      initDataValues();
    }
  } else { loadDashboard(); }
};

/**
 * Get the BESS status text based on the sensor value
 * @param value The sensor value
 * @returns The corresponding BESS status text
 */
const getBessStatus = (value: number): string => {
  if (value === null || value === undefined) {
    return 'general.unknown';
  }
  if ((value >= 0) && (value <= 6)) {
    return 'pages.hmi.bess_status.' + value;
  } else { return 'general.unknown'; }
};

/**
 * Fetch the latest measurements for the dashboard from the API and update the sensor values and last update timestamps
 */
const getMeasurements = async (): Promise<void> => {
  const apiUrl = `${AppSettings.env.API_URL}/measurements/hmi/get`;
  axios
    .get(apiUrl, {
      headers: GetURLHeader()
    })
    .then((response) => {
      const currentTime = new Date().getTime() / 1000; // Current time in seconds
      for (const m of response.data) {
        try {
          const utime = new Date(m.updated); // Convert updated time to Date object
          const outdated = (currentTime - utime.getTime() / 1000) > AppSettings.HMIDataOutdatedLimit; // Check if data is outdated
          lastDataUpdate.value[m.id] = { last: utime.getDate() + '.' + (utime.getMonth() + 1) + '.' + utime.getFullYear() + ' ' + utime.getHours() + ':' + utime.getMinutes().toFixed().padStart(2, '0'), outdated }; // Format the timestamp for display
        } catch (e) { lastDataUpdate.value[m.id] = 'unknown'; }
        for (const s of m.sensors) {
          dataValues.value[s.sensor] = s.value;
        }
      }
    })
    .catch((err) => {
      pageStatus.value = 2;
    });
};

/**
 * Initialize the sensor values and last update timestamps for each item in the dashboard, then fetch the latest measurements
 */
const initDataValues = (): void => {
  pageStatus.value = 1;
  for (const item of dashboardData.value) {
    lastDataUpdate.value[item.name] = null; // Initialize last update time for the item
    for (const sensor of item.sensors) {
      for (const sensor2 of sensor) {
        if (sensor2.id !== '') {
          dataValues.value[sensor2.id] = null; // Initialize sensor values
        }
      }
    }
  }
  getMeasurements(); // Get measurements after loading dashboard data
}

/**
 * Fetch the dashboard data from the API, process it, and store it in local storage with a timestamp. If the API call fails, set the error state to true.
 */
const loadDashboard = async (): Promise<void> => {
  pageStatus.value = 0;
  const apiUrl = `${AppSettings.env.API_URL}/dashboard/get/hmi`;
  axios
    .get(apiUrl, {
      headers: GetURLHeader()
    })
    .then((response) => {
      StorageSet('dashboardHMI', { ts: new Date().getTime() / 1000, data: response.data });
      processDashboard(response.data);
      pageStatus.value = 1;
      initDataValues();
    })
    .catch((err) => {
      pageStatus.value = 2;
    });
};

/**
 * Process the dashboard data and organize it for display
 * @param dashboard The raw dashboard data from the API
 */
const processDashboard = (dashboard: any): void => {
  const dbdata: any[] = [];
  for (const item of dashboard) {
    const dbitem: any = { sensors: [], name: item.name };
    let dbsindex = -1;
    for (const sensor of item.sensors) {
      let split = sensor.elementType.split('_');
      let idx = parseInt(split[1]);
      if (idx === 0) { // New row of sensors, add a new array to the sensors array
        dbitem.sensors.push([]);
        dbsindex++;
      }
      sensor.elementType = split[0];
      dbitem.sensors[dbitem.sensors.length - 1].push(sensor);
      dbsindex = idx;
    }
    dbdata.push(dbitem);
  }
  dashboardData.value = dbdata;
}
</script>
<style scoped>
.animation-yellow-flashing {
  animation: flash-yellow 2s infinite;
  color: yellow;
}

.divider {
  width: 100%;
  height: 1px;
  background-color: var(--color-black);
  margin: 1em 0;
}

.element-margin {
  margin-bottom: 1em;
}

@keyframes flash-yellow {
  0% { opacity: 0; }
  25% { opacity: 1; }
  75% { opacity: 1; }
  100% { opacity: 0; }
}

.hmi-dashboard-item {
  max-width: 800px;
  margin-top: 2em;
}

.hmi-soutput {
  background-color: var(--color-white);
  border: 1px solid var(--color-input-border);
  border-radius: 6px;
  padding: 8px 12px;
  text-align: center;
}

.text-larger0 { font-size: 1.25em; }
.text-larger1 { font-size: 1.33em; }
.text-larger2 { font-size: 1.5em; }

@media (max-width: 599px) { /* extra small screens */
  .hmi-dashboard-item { width: 100%; }
  .value-output { width: 90%; }
}

@media (min-width: 600px) { /* small screens */
  .hmi-dashboard-item { width: 90%; }
  .value-output { width: 16em; }
}
@media (min-width: 768px) { /* tablets */
  .hmi-dashboard-item { width: 70%; }
  .value-output { width: 16em; }
}
@media (min-width: 1024px) { /* desktops */
  .hmi-dashboard-item { width: 60%; }
  .value-output { width: 18em; }
}
@media (min-width: 1280px) { /* large desktops */
  .hmi-dashboard-item { width: 60%; }
  .value-output { width: 20em; }
}
</style>