<template>
  <div :class="['dashboard-edit-container', { 'flex-center': pageStatus !== 3 }]">
    <ConfirmDialog group="dashboard-edit">
      <template #message="slotProps">
        <div class="flex flex-col items-center w-full gap-4 border-b border-surface-200 dark:border-surface-700">
          <i :class="slotProps.message.icon" class="!text-6xl text-primary-500"></i>
          <p>{{ slotProps.message.message }}</p>
        </div>
      </template>
    </ConfirmDialog>

    <div v-if="pageStatus === 1 || pageStatus === 4">
      <Loader :text="'pages.dashboard-edit.status' + pageStatus" />
    </div>
    <div v-if="pageStatus === 2">
      <ErrorRetry message="pages.dashboard-edit.status2" @reload="loadDashboard()" />
    </div>
    <div class="dashboard-edit-content" v-show="pageStatus === 3">
      <div class="header">
        <Button type="button" :label="$t('buttons.save')" icon="pi pi-save" @click="saveDashboard()"></Button>
        <span>{{ $t('pages.dashboard-edit.dashboardType.' + dashboardType) }}</span>
      </div>
      
      <div class="chart-grid">
        <div v-for="(snr, index) of sensors" :class="['chart-item chart-size-width-' + snr.size[0] + ' chart-size-height-' + snr.size[1]]" :key="index">
          <div :class="['chart-test chart-test-height-' + snr.size[1]]">
            <Chart
              :counter="snr.counter"
              :edit="true"
              :index="index"
              :name="snr.name"
              :sensors="snr.sensors"
              :sindex="snr.index"
            />
          </div>

          <div class="button-delete pointer" type="button" @click="deleteChart(index)">
            <i class="pi pi-times" />
          </div>

          <div class="button-move pointer" type="button">
            <i :class="['pi pi-arrow-left margin-right', { 'button-icon-disabled': index === 0 }]" @click="moveChart(index, -1)" />
            <i :class="['pi pi-arrow-right', { 'button-icon-disabled': index === sensors.length - 1 }]" @click="moveChart(index, 1)" />
          </div>

          <div class="position-relative">
            <IftaLabel>
              <InputText id="sensorName" class="w-full" v-model="snr.name" :maxlength="80"  @update:modelValue="incrementCounter(snr)" />
              <label for="sensorName">{{ $t('pages.dashboard-edit.select_sensor_name') }}</label>
            </IftaLabel>
            <span class="name-counter">{{ snr.name.length }}/{{ AppSettings.inputMax.dashboardChartNameMax }}</span>
          </div>
          <div class="position-relative">
            <IftaLabel v-for="(dsnr, dIndex) in snr.sensors" :key="dIndex">
              <Select class="w-full" v-model="dsnr.sensor" inputId="sensorSelect" :options="sensorList" optionLabel="listName" optionValue="id" :placeholder="$t('general.none')" />
              <label for="sensorSelect">{{ $t('pages.dashboard-edit.select_sensor') }}</label>
              <i class="pi pi-trash pointer chart-delete" @click="deleteChartSensor(snr, dIndex)" />
              <i :class="['pi pointer chart-type-picker',{ 'pi-chart-bar': dsnr.type === 'bar', 'pi-chart-line': dsnr.type === 'line' }]" @click="changeChartType(snr, dsnr)" />
              <ColorPicker v-model="dsnr.color" class="color-picker" format="hex" @change="incrementCounter(snr)" />
            </IftaLabel>
            <IftaLabel>
              <Select class="w-full" :options="sizeOptions" v-model="snr.size" optionLabel="label" optionValue="value" placeholder="1x1" />
              <label>{{ $t('pages.dashboard-edit.select_chart_size') }}</label>
            </IftaLabel>
            <div v-if="snr.sensors.length < 5" class="width-100 flex-center">
              <Button type="button" class="width-100" :label="$t('buttons.addnewchartsensor')" icon="pi pi-plus" @click="addChartSensor(snr)" />
            </div>
          </div>
        </div>
        <div v-if="sensors.length < 50" class="slot add-new flex-center">
          <Button type="button" :label="$t('buttons.addnew')" icon="pi pi-plus" @click="addNewChart()" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { StorageGet, StorageSet } from '../../services/Storage';
import { DashboardSensorObject, DashboardSensorSaveObject, MeasurementDataObject, MeasurementObject, SensorEditList } from '../../services/Interfaces';
import { dialogShow } from '../../services/Dialog';
import { useI18n } from 'vue-i18n';
import { ConfirmDialog, IftaLabel, InputText, Select } from 'primevue';
import ColorPicker from 'primevue/colorpicker';
import { AppSettings } from '../../services/Settings';
import axios from 'axios';
import { GetURLHeader } from '../../services/Utils';
import { toastShow } from '../../services/Toast';
import Loader from '../../components/Loader.vue';
import Chart from '../../components/Chart.vue';
import ErrorRetry from '../../components/ErrorRetry.vue';

const { t } = useI18n();

const dashboardType = StorageGet('dashboardSelect'); // Get the selected dashboard type from storage
/*
  0 = init
  1 = loading dashboard
  2 = load error
  3 = ok
  4 = saving dashboard
  5 = save error
*/
const pageStatus = ref(0);
let sensorId = 0;
const sensorList = ref<SensorEditList[]>([]);
const sensors = ref<DashboardSensorObject[]>([]);
const sizeOptions = [
  { label: '1x1', value: [1, 1] },
  { label: '2x1', value: [2, 1] },
  { label: '3x1', value: [3, 1] },
  { label: '1x2', value: [1, 2] },
  { label: '2x2', value: [2, 2] },
  { label: '3x2', value: [3, 2] },
  { label: '1x3', value: [1, 3] },
  { label: '2x3', value: [2, 3] },
  { label: '3x3', value: [3, 3] }
];
const testMeasurments = ref<MeasurementObject[]>([]);

onMounted(() => {
  loadSensors();
});

/**
 * Add a new chart sensor to the specified chart
 * @param snr The chart to which the sensor will be added
 */
const addChartSensor = (snr: DashboardSensorObject): void => {
  if (snr.sensors.length >= 10) { return; }
  snr.sensors.push({ color: '00ff00', measurements: generateTestData(), name: '', sensor: '', type: 'line', unit: '' });
  incrementCounter(snr);
}

/**
 * Add a new chart to the dashboard
 */
const addNewChart = () => {
  sensors.value.push({
    counter: 0,
    index: sensorId,
    name: '',
    sensors: [],
    size: [1, 1],
    status: 0,
  });
  sensorId++;
}

/**
 * Change the chart type of a specific chart sensor
 * @param snr The chart to which the sensor belongs
 * @param dsnr The sensor whose chart type will be changed
 */
const changeChartType = (snr: DashboardSensorObject, dsnr: { type: string; color: string; sensor: string; unit?: string }): void => {
  if (dsnr.type === 'line') { dsnr.type = 'bar'; } else { dsnr.type = 'line'; }
  incrementCounter(snr);
}

/**
 * Delete a specific chart sensor from an existing chart
 * @param snr The chart from which the sensor will be deleted
 * @param dIndex The index of the sensor to be deleted
 */
const deleteChartSensor = (snr: DashboardSensorObject, dIndex: number): void => {
  dialogShow({
    group: 'dialogconfirm',
    header: t('pages.dashboard-edit.delete'),
    message: t('pages.dashboard-edit.delete_chart_sensor'),
    rejectProps: {
      label: t('buttons.cancel'),
      icon: 'pi pi-times',
      outlined: true,
      size: 'small'
    },
    acceptProps: {
      label: t('buttons.confirm'),
      icon: 'pi pi-check',
      size: 'small'
    },
    accept: () => {
      snr.sensors.splice(dIndex, 1);
      incrementCounter(snr);
    },
    reject: () => {}
  });
}

/**
 * Delete an entire chart from the dashboard
 * @param index The index of the chart to be deleted
 */
const deleteChart = (index: number): void => {
  dialogShow({
    group: 'dialogconfirm',
    header: t('pages.dashboard-edit.delete'),
    message: t('pages.dashboard-edit.delete_message'),
    rejectProps: {
      label: t('buttons.cancel'),
      icon: 'pi pi-times',
      outlined: true,
      size: 'small'
    },
    acceptProps: {
      label: t('buttons.confirm'),
      icon: 'pi pi-check',
      size: 'small'
    },
    accept: () => {
      sensors.value.splice(index, 1);
    },
    reject: () => {}
  });
}

/**
 * Generate test data for chart sensor
 * @returns An array of measurement data objects
 */
const generateTestData = (): MeasurementDataObject[] => {
  const data: MeasurementDataObject[] = [];

  let date = new Date().getTime() / 1000;
  let value = Math.floor(1000 - Math.random() * 2000) / 10;

  for (let d = 0; d < 10; d++) {
    value += Math.floor(300 - Math.random() * 400) / 10;
    data.unshift({ x: Math.floor(date - d * 15 * 60), y: value });
  }
  return data;
}

/**
 * Increment chart counter to force chart reload
 * @param snr The chart sensor object
 */
const incrementCounter = (snr: DashboardSensorObject): void => {
  snr.counter = (snr.counter ?? 0) + 1;
}

/**
 * Load the dashboard data
 */
const loadDashboard = (): void => {
  pageStatus.value = 1;
  const apiUrl = `${AppSettings.env.API_URL}/dashboard/get/${dashboardType}`;
  axios
    .get(apiUrl, {
      headers: GetURLHeader()
    })
    .then((response) => {
      for (const d of response.data) {
        d.counter = 0;
        d.index = sensorId;
        d.status = 0;
        for (const d2 of d.sensors) { d2.measurements = generateTestData(); }
        sensorId++;
      }
      sensors.value = response.data;
      pageStatus.value = 3;
    })
    .catch((error) => {
      pageStatus.value = 2;
    });
}

/**
 * Load the list of available sensors from the API
 */
const loadSensors = (): void => {
  sensorList.value = [];
  const apiUrl = `${AppSettings.env.API_URL}/sensor/edit/${dashboardType}`;
  axios
    .get(apiUrl, {
      headers: GetURLHeader()
    })
    .then((response) => {
      for (const sensor of response.data) {
        sensorList.value.push({ color: sensor.color, id: sensor.id, listName: sensor.organisation + '.' + sensor.name, name: sensor.name, unit: sensor.unit });
      }
    })
    .catch((error) => {
    }).finally(() => {
      loadDashboard();
    });
}

/**
 * Move a chart up or down in the dashboard order
 * @param index The index of the chart to move
 * @param direction The direction to move the chart (-1 for up, 1 for down)
 */
const moveChart = (index: number, direction: -1 | 1): void => {
  const temp: DashboardSensorObject = sensors.value[index];
  sensors.value[index] = sensors.value[index + direction];
  sensors.value[index + direction] = temp;

  const temp2: MeasurementObject = testMeasurments.value[index];
  testMeasurments.value[index] = testMeasurments.value[index + direction];
  testMeasurments.value[index + direction] = temp2;
}

/**
 * Save the current dashboard configuration to the API
 */
const saveDashboard = (): void => {
  dialogShow({
    group: 'dialogconfirm',
    header: t('pages.dashboard-edit.save'),
    message: t('pages.dashboard-edit.save_message'),
    rejectProps: {
      label: t('buttons.cancel'),
      icon: 'pi pi-times',
      outlined: true,
      size: 'small'
    },
    acceptProps: {
      label: t('buttons.confirm'),
      icon: 'pi pi-check',
      size: 'small'
    },
    accept: () => {
      const apiUrl = `${AppSettings.env.API_URL}/dashboard/update/${dashboardType}`;
      const newDashboard: DashboardSensorSaveObject[] = [];
      for (const snr of sensors.value) {
        const sensors: any[] = [];
        const newSnr: DashboardSensorSaveObject = {
          name: snr.name,
          sensors,
          size: snr.size
        };
        for (const dsnr of snr.sensors) {
          sensors.push({
            color: dsnr.color,
            name: dsnr.name,
            sensor: dsnr.sensor,
            type: dsnr.type
          });
        }
        newDashboard.push(newSnr);
      }
      
      axios
        .post(apiUrl, newDashboard, {
          headers: GetURLHeader()
        })
        .then((response) => {
          toastShow(t('pages.dashboard-edit.title'), t('toast.user_dashboard_save_ok'), 'success');
          StorageSet('dashboard', newDashboard);
          StorageSet('dashboardUpdate', true);
        })
        .catch((error) => {
          toastShow(t('pages.dashboard-edit.title'), t('toast.user_dashboard_save_fail'), 'error');
        });
    },
    reject: () => {}
  });
}
</script>

<style scoped>
.add-new {
  background-color: var(--p-button-primary-background);
  padding: 0 !important;
  width: 32%;
}
.add-new Button {
  width: 100%;
  height: 100%;
}

.button-move {
  position: absolute;
  top: 0.5em;
  left: 0.5em;
}

.button-delete {
  position: absolute;
  top: 0.5em;
  right: 0.5em;
}

.chart-delete {
  position: absolute;
  right: 7em;
  top: 13%;
}

.chart-test {
  width: 100%;
}

.color-picker {
  border: 1px solid var(--color-black);
  border-radius: 0.35em;
  position: absolute;
  right: 2.5em;
  top: 10%;
}

.chart-type-picker {
  position: absolute;
  right: 5em;
  top: 13%;
}

.dashboard-edit-container {
  width: 100%;
  height: 100%;
  padding: 1em;
}

.header { margin-bottom: 1em; }
.header Button { margin-right: 1em; }

.name-counter {
  position: absolute;
  right: 0.5em;
  top: 0.25em;
}

.slot {
  border: 1px solid var(--color-black);
  border-radius: 0.5em;
  height: 30em;
  padding: 0.5em;
  position: relative;
  overflow-y: auto;
}
</style>