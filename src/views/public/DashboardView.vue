<template>
  <div class="dashboard-container">
    <i v-if="dashboard === 'user'" class="edit-button pointer pi pi-cog" @click="openEdit()"></i>
    <div v-if="dashboardLoadError === false && sensors.length > 0" class="dashboard-content sensor-detail">
      <div class="margin-bottom flex flex-col space-x-2">
        <Select class="w-full md:w-56" v-model="selectedRange" :disabled="dataFetch.run" :options="timeOptions" optionLabel="name" optionValue="type" placeholder="Test" @change="setRange()" />
        <div v-if="selectedRange === 'custom-month'" class="flex flex-col custom-select margin-top-smaller">
          <div class="flex">
            <div class="month-dropdown">
              <select
                name="months"
                id="months"
                v-model="selectedMonth"
              >
                <option v-for="(month, index) in months" :key="month" :value="index">
                  {{ $t('general.months.' + month) }}
                </option>
              </select>
            </div>
            <div class="year-dropdown">
              <select
                name="years"
                id="years"
                v-model="selectedYear"
              >
                <option v-for="year in years" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>
            <Button class="ml-2" label="Load" @click="onMonthOrYearChange" />
          </div>
        </div>

        <div v-if="selectedRange === 'custom-range'" class="flex flex-col custom-select margin-top-smaller">
          <div class="flex">
            <DatePicker v-model="datesCustomRange" selectionMode="range" :manualInput="false" :maxDate="maxDate" dateFormat="dd.mm.yy" :placeholder="$t('pages.dashboard-view.daterange')" showIcon fluid iconDisplay="input" />
            <Button class="ml-2" label="Load" @click="loadDashboardRange" />
          </div>
        </div>
      </div>

      <div class="content">
        <div class="grid grid-cols-3 gap-4">
          <div v-for="(snr, index) of sensors" :class="['slot', { 'error-text': snr.status >= 0 && snr.status <= 3, 'flex-center': snr.status < 5 }]">
            <Loader v-if="snr.status === 10 || snr.status === 1" text="pages.dashboard-view.sensor_data_load" />
            <ErrorRetry v-else-if="snr.status === 2" message="pages.dashboard-view.error2" @reload="fetchMeasurementsRetry(index)" />
            <ErrorRetry v-else-if="snr.status === 3" message="pages.dashboard-view.error3" @reload="fetchMeasurementsRetry(index)" />
            <ErrorRetry v-else-if="snr.status === 4" message="pages.dashboard-view.error4" @reload="fetchMeasurementsRetry(index)" />
            <Chart v-else-if="snr.status === 5"
              :index="index"
              :name="snr.name"
              :sensors="snr.sensors"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="size100 flex-center" v-if="dashboardLoadError === false && sensors.length === 0">
      {{ $t('pages.dashboard-view.nodashboard') }}
    </div>

    <div v-if="dashboardLoadError == true" class="size100 dashboard-bottom flex-center">
      <ErrorRetry message="pages.dashboard-view.error0" @reload="loadDashboard()" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import axios from 'axios';
import { Button, DatePicker, Select } from 'primevue';
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { DashboardSensorObject, MeasurementResponseObject } from '../../services/Interfaces';
import Chart from '../../components/Chart.vue';
import ErrorRetry from '../../components/ErrorRetry.vue';
import Loader from '../../components/Loader.vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { GetURLHeader } from '../../services/Utils';
import { AppSettings } from '../../services/Settings';
import { StorageGet } from '../../services/Storage';
import { toastShow } from '../../services/Toast';

const { t } = useI18n();
const props = defineProps({
  dashboard: {
    default: '',
    type: String
  }
});

watch(() => props.dashboard, (newValue: string) => {
  if (newValue !== '') {
    loadDashboard(); // Load the dashboard when the dashboard changes
  }
});

const router = useRouter();

const date = new Date(); // Current date

const currentDateRange = ref({ end: '', start: '' }); // Current date range
const currentYear = date.getFullYear(); // Current year
const dashboardLoadError = ref(false); // Dashboard load error state
const dataFetch = reactive({ loaded: 0, max: 0, run: false }); // Data fetch state
const datesCustomRange = ref(); // set custom date range
const maxDate = date; // Maximum selectable date
const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // Months array
const selectedMonth = ref(); // Selected month
const selectedRange = ref(); // Default: "Today"
const selectedYear = ref(date.getFullYear()); // Selected year
const sensors = ref<DashboardSensorObject[]>([]); // Sensors array
const timeOptions = computed(() => [ // Time range options
  { name: t('pages.dashboard-view.options.day'), type: 'day' }, // Today
  { name: t('pages.dashboard-view.options.week'), type: 'week' }, // This week
  { name: t('pages.dashboard-view.options.month'), type: 'month' }, // This month
  { name: t('pages.dashboard-view.options.custom_month'), type: 'custom-month' }, // Custom month
  { name: t('pages.dashboard-view.options.custom_range'), type: 'custom-range' } // Custom range
]);
const years = Array.from({ length: 2 }, (_, i) => currentYear - i); // Years array

const updateTimeout = ref<ReturnType<typeof setTimeout> | null>(null); // Update interval

onMounted(() => {
  loadDashboard(); // Load the dashboard on component mount
});

onUnmounted(() => {
  if (updateTimeout.value) {
    clearTimeout(updateTimeout.value); // Clear the update interval on unmount
    updateTimeout.value = null;
  }
});

/**
 * Fetch measurements for a specific time range
 * @param startTime The start time of the range
 * @param endTime The end time of the range
 */
const fetchMeasurements = async (startTime: string, endTime: string): Promise<void> => {
  if (dataFetch.run === true) {
    return; // Prevent overlapping fetches
  }
  dataFetch.run = true;

  if (updateTimeout.value) {
    clearTimeout(updateTimeout.value); // Clear existing interval
  }
  updateTimeout.value = setTimeout(() => {
    fetchMeasurements(startTime, endTime);
  }, AppSettings.env.DASHBOARD_UPDATE_INTERVAL * 1000); // Set new interval

  const sid: string[] = [];

  for (const s of sensors.value) {
    s.status = 1;
    for (const s2 of s.sensors) {
      if (sid.includes(s2.sensor) === false) { sid.push(s2.sensor); }
    }
  }
  dataFetch.loaded = 0;
  dataFetch.max = sid.length;

  const mdata: { [key: string]: any } = {};
  if (dataFetch.max > 0) {
    for (const s of sid) {
      const apiUrl = `${AppSettings.env.API_URL}/public/measurements/${s}`;
      axios
        .post(apiUrl, { startTime, endTime }, {
          headers: GetURLHeader()
        })
        .then((response) => {
          mdata[s] = { data: response.data, error: false };
        })
        .catch((error) => {
          mdata[s] = { data: [], error: true };
        })
        .finally(() => {
          dataFetch.loaded++;
          if (dataFetch.loaded === dataFetch.max) {
            dataFetch.run = false;
            fetchMeasurementsDone(mdata, false, true);
          }
        });
    }
  } else { // No sensors to fetch, display error after short delay
    dataFetch.run = false;
    fetchMeasurementsDone(mdata, false, true);
  }
}

/**
 * Process fetched measurements and update sensor statuses
 * @param measurements Measurements data
 * @param update Update measurements flag
 */
const fetchMeasurementsDone = async (measurements: { [key: string]: MeasurementResponseObject }, update = false, init = false): Promise<void> => {
  for (const s of sensors.value) {
    const sresult = { error: 0, none: 0, ok: 0 };
    let skipSensor = false;
    let updateCount = 0;
    if (s.sensors.length === 0) {
      s.status = 3; // No sensors configured
      continue;
    }
    for (const s2 of s.sensors) {
      const sdata = measurements[s2.sensor];
      if ((update === true) && (sdata === undefined)) {
        skipSensor = true; // Skip updating this sensor if data is missing during an update
        continue;
      }
      if (sdata.error === true) {
        sresult.error++;
        continue;
      }
      if (sdata === undefined) {
        if (update === true) {
          continue;
        } else if (init === true) {
          sresult.none++;
          continue;
        }
      }
      updateCount++;
      if (sdata.data.length > 0) {
        sresult.ok++;
        s2.measurements = sdata.data;
      } else if (sdata.data.length === 0) {
        sresult.none++;
      } else { sresult.error++; }
    }
    
    if ((update === true) && (skipSensor === true)) {
      continue; // Skip updating this sensor's status if data is missing during an update
    }
    // Set status based on results
    if (sresult.ok > 0) { // At least one sensor returned data
      s.status = 5;
    } else if (sresult.none > 0) { // Some of the sensors returned no data
      s.status = 4;
    } else { s.status = 2; } // All sensors errored
  }
}

/**
 * Retry fetching measurements for a specific sensor index
 * @param sensorIndex The index of the sensor to retry
 */
const fetchMeasurementsRetry = async (sensorIndex: number): Promise<void> => {
  dataFetch.run = true;
  const sensor = sensors.value[sensorIndex];
  sensor.status = 1;

  dataFetch.loaded = 0;
  dataFetch.max = sensor.sensors.length;
  const mdata: { [key: string]: MeasurementResponseObject } = {};

  if (dataFetch.max > 0) { // Fetch measurements for each sensor
    for (const s of sensor.sensors) {
      axios
        .post(`${AppSettings.env.API_URL}/measurements/${s.sensor}`, { startTime: currentDateRange.value.start, endTime: currentDateRange.value.end }, {
          headers: GetURLHeader()
        })
        .then((response) => {
          mdata[s.sensor] = { data: response.data, error: false };
        })
        .catch((error) => {
          mdata[s.sensor] = { data: [], error: true };
        }).finally(() => {
          dataFetch.loaded++;
          if (dataFetch.loaded === dataFetch.max) {
            dataFetch.run = false;
            fetchMeasurementsDone(mdata, true);
          }
        });
    }
  } else { // No sensors to fetch, display error after short delay
    setTimeout(() => { // Small delay to show loading state
      dataFetch.run = false;
      fetchMeasurementsDone(mdata, false, true);
    }, 500);
  }
}

/**
 * Handle custom date range selection
 */
const loadDashboardRange = (): void => {
  if ((datesCustomRange.value !== undefined) && (datesCustomRange.value.length === 2)) {
    const endDate = datesCustomRange.value[1] !== null ? datesCustomRange.value[1] : datesCustomRange.value[0];
    const startTime = new Date(datesCustomRange.value[0]).toISOString();
    const endTime = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999).toISOString();
    fetchMeasurements(startTime, endTime);
  } else {
    toastShow(t('pages.dashboard-view.title'), t('pages.dashboard-view.no_range_selected'), 'error');
  }
};

/**
 * Load the dashboard data
 */
const loadDashboard = (): void => {
  const value = StorageGet('dashboard' + props.dashboard.charAt(0).toUpperCase() + props.dashboard.slice(1));
  sensors.value = value.data;
  dashboardLoadError.value = false;
  setRange('day');
}

/**
 * Handle month or year change for custom month selection
 */
const onMonthOrYearChange = (): void => {
  if (selectedMonth.value === undefined) { return; }
  const startOfMonth = new Date(selectedYear.value, selectedMonth.value, 1);
  const endOfMonth = new Date(selectedYear.value, selectedMonth.value + 1, 0, 23, 59, 59, 999);
  const startTime = startOfMonth.toISOString();
  const endTime = endOfMonth.toISOString();
  fetchMeasurements(startTime, endTime);
};

/**
 * Open the dashboard edit page
 */
const openEdit = (): void => {
  router.push('/dashboard/edit');
}

/**
 * Set the date range for the dashboard
 * @param range The selected date range
 */
const setRange = (range: 'custom' | 'day' | 'month' | 'week' | null = null): void => {
  if (range !== null) { selectedRange.value = range; }
  if (sensors.value.length === 0) { return; } // No sensors to fetch data for
  const now = new Date();
  let startTime = ''
  let endTime = new Date(now.setHours(23, 59, 59, 999)).toISOString(); // End of today

  switch (selectedRange.value) {
    case 'day': {
      startTime = new Date(now.setHours(0, 0, 0, 0)).toISOString(); // Start of today
      /*if (process.env.NODE_ENV === 'development') {
        // Simulate today for development
        startTime = new Date('2025-10-01T00:00:00').toISOString(); // Start of October 1, 2024
        endTime = new Date('2025-10-01T23:59:59.999').toISOString(); // End of October 1, 2024
      }*/
      break;
    }
    case 'week': {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Start of the week (Monday)
      startTime = new Date(startOfWeek.setHours(0, 0, 0, 0)).toISOString();
      break;
    }
    case 'month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // Start of the month
      startTime = new Date(startOfMonth.setHours(0, 0, 0, 0)).toISOString();
      break;
    }
    default: { return; }
  }
  currentDateRange.value = { end: endTime, start: startTime };
  fetchMeasurements(startTime, endTime);
}
</script>
<style scoped>
#custom-load-btn .p-button-label { color: #fff !important; }

.edit-button {
  position: absolute;
  font-size: 1.5em;
  top: 0.75em;
  right: 0.75em;
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

.custon-load-container {
  max-width: 10em;
  min-width: 10em;
}

.dashboard-container {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.dashboard-content { overflow: auto; }

.dashboard-top {
  flex: 1;
  align-items: center;
  padding-left: 1em;
}

.dropdown-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.error-text {
  display: flex;
  justify-content: center;
  text-align: center;
  padding: 2em !important;
}

.dashboard-header { flex: 1; }

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

.sensor-chart-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.sensor-chart-container > * {
  flex-basis: calc(50% - 8px);
  box-sizing: border-box;
}

.sensor-chart-grid {
  gap: 10px;
  width: 100%;
  height: 100%;
}

.sensor-chart-grid > * {
  width: 100%;
  max-width: 600px;
  height: 600px;
  max-height: 600px;
}

.sensor-detail { padding: 10px; }

.slot {
  border: 1px solid var(--color-black);
  border-radius: 0.5em;
  height: 30em;
  width: 100%;
  padding: 0.5em;
  position: relative;
  overflow: hidden;
}
</style>
