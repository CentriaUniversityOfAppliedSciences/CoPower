<template>
  <div class="full-screen-relative">
    <Dialog ref="addEditUserDialog" v-model:visible="addEditDialog.active" :validateOnValueUpdate="true" :validateOnBlur="true" :validateOnMount="['email', 'name']" modal :header="$t('general.' + selected.dialog)" :style="{ width: '40rem' }">
      <Form v-slot="$form" :initialValues="{ access: '', disabled: false, email: '', name: addEditDialog.data.name, organisation: '' }" @submit="editAddSensor" class="flex flex-col gap-4 w-full">
        <div class="flex items-center gap-4 mb-4">
          <FormField class="flex flex-col gap-1 width-100">
            <label class="font-semibold w-24 width-100">{{ t('general.organisation') }}</label>
            <span>{{ addEditDialog.data.orgName }}</span>
          </FormField>
        </div>
        <div class="flex-col items-center gap-4 mb-4">
          <FormField v-slot="$field" name="deviceSource" :initialValue="addEditDialog.data.deviceSource" class="flex flex-col gap-1 width-100">
            <label for="deviceSource" class="font-semibold w-24 width-100">{{ t('general.deviceSource') }}</label>
            <InputText v-model="addEditDialog.data.deviceSource" type="text" id="deviceSource" class="flex-auto" autocomplete="off" :maxlength="AppSettings.inputMax.deviceSource" />
          </FormField>
        </div>
        <div class="flex-col items-center gap-4 mb-4">
          <FormField v-slot="$field" name="name" :initialValue="addEditDialog.data.name" class="flex flex-col gap-1 width-100">
            <label for="name" class="font-semibold w-24 width-100">{{ t('general.name') }}</label>
            <InputText v-model="addEditDialog.data.name" type="text" id="name" class="flex-auto" autocomplete="off" :maxlength="AppSettings.inputMax.name" />
          </FormField>
        </div>
        <div class="flex-col items-center gap-4 mb-4">
          <FormField v-slot="$field" name="unit" :initialValue="addEditDialog.data.unit" class="flex flex-col gap-1 width-100">
            <label for="unit" class="font-semibold w-24 width-100">{{ t('general.unit') }}</label>
            <InputText v-model="addEditDialog.data.unit" type="text" id="unit" class="flex-auto" autocomplete="off" :maxlength="AppSettings.inputMax.unit" />
          </FormField>
        </div>
        <div class="flex-col items-center gap-4 mb-4">
          <FormField v-slot="$field" name="valueChange" :initialValue="addEditDialog.data.valueChange" class="flex flex-col gap-1 width-100">
            <label for="valueChange" class="font-semibold w-24 width-100">{{ t('general.valueChange') }}</label>
            <InputNumber v-model="addEditDialog.data.valueChange" type="text" id="valueChange" class="flex-auto" autocomplete="off" locale="fi-FI" :max="AppSettings.inputMax.valueChange" :max-fraction-digits="9" :min="0" :min-fraction-digits="0"/>
          </FormField>
        </div>
        <div class="flex items-center gap-4">
          <FormField v-slot="$field" name="shared" :initialValue="false" class="flex flex-col gap-1 width-100">
            <label for="status" class="font-semibold w-24 width-100">{{ t('general.shared') }}</label>
            <SelectButton v-model="addEditDialog.data.shared" :options="sharedOptions" optionLabel="label" optionValue="value" dataKey="value" aria-labelledby="custom">
              <template #option="slotProps">
                <i :class="'margin-right ' + slotProps.option.icon"></i>
                <label>{{ $t(slotProps.option.label) }}</label>
              </template>
            </SelectButton>
          </FormField>
        </div>
        <div class="flex items-center gap-4">
          <FormField v-slot="$field" name="status" :initialValue="false" class="flex flex-col gap-1 width-100">
            <label for="status" class="font-semibold w-24 width-100">{{ t('general.status') }}</label>
            <ToggleButton id="status" v-model="addEditDialog.data.disabled" :onLabel="$t('general.deactivated')" :offLabel="$t('general.activated')" />
          </FormField>
        </div>
        <div class="flex-col items-center gap-4 mb-4">
          <label class="font-semibold w-24 width-100">{{ t('pages.settings.sensors.source') }}</label>
          <div class="source-tree-container">
            <Tree v-model:expandedKeys="expandedKeys" v-model:selectionKeys="selectedSource" :value="sources" selectionMode="single" class="w-full md:w-[30rem]" />
          </div>
        </div>
        <div>
          <label class="form-error-message" v-if="addEditDialog.error.timeout !== null">{{ t('validation.' + addEditDialog.error.message)}}</label>
        </div>
        <div class="flex justify-end gap-2">
          <Button type="button" :label="$t('buttons.cancel')" severity="secondary" @click="addEditDialog.active = false"></Button>
          <Button :label="$t('buttons.save')" type="submit"></Button>
        </div>
      </Form>
    </Dialog>
    <Dialog ref="insertMeasurementDialog" v-model:visible="insertMeasurementData.active" modal :header="$t('pages.settings.sensors.insert_measurement.title', { sensor: insertMeasurementData.data.sensorName })" :style="{ width: '40rem' }">
      <Form v-slot="$form" :initialValues="{ date: null, measurement: null }" @submit="insertSensorMeasurement" class="flex flex-col gap-4 w-full">
        <div class="flex items-center gap-4">
          <FormField v-slot="$field" name="date" :initialValue="insertMeasurementData.data.date" class="flex flex-col gap-1 width-100">
            <label for="date" class="font-semibold w-24 width-100">{{ t('pages.settings.sensors.insert_measurement.date') }}</label>
            <DatePicker v-model="insertMeasurementData.data.date" id="date" class="flex-auto" dateFormat="d.m.yy" :maxDate="insertMeasurementData.data.maxDate" showClear showSeconds showTime />
          </FormField>
        </div>
        <div class="flex items-center gap-4">
          <FormField v-slot="$field" name="measurement" :initialValue="insertMeasurementData.data.measurement" class="flex flex-col gap-1 width-100">
            <label for="measurement" class="font-semibold w-24 width-100">{{ t('pages.settings.sensors.insert_measurement.measurement') }}</label>
            <InputNumber v-model="insertMeasurementData.data.measurement" class="flex-auto" id="measurement" :max="99999999999" :maxFractionDigits="5" :min="-99999999999" :minFractionDigits="0" :useGrouping="false" @input="refocusInput" />
          </FormField>
        </div>
        <div class="flex justify-end gap-2">
          <Button type="button" :label="$t('buttons.cancel')" severity="secondary" @click="insertMeasurementData.active = false"></Button>
          <Button :label="$t('buttons.save')" type="submit" :disabled="insertMeasurementData.data.date === null || insertMeasurementData.data.measurement === null"></Button>
        </div>
      </Form>
    </Dialog>
    <div v-if="pageStatus === 0">
      <Loader :absolute="true"/>
    </div>
    <div v-else-if="pageStatus === 1" class="card">
      <TreeTable :value="datalist" tableStyle="min-width: 50rem" removableSort>
        <template #header>
          <div class="text-xl font-bold">{{ $t('pages.settings.sensors.title') }}</div>
        </template>
        <Column field="disabled" header="" style="width: 2%">
          <template #body="slotProps">
            <i v-if="slotProps.node.data.disabled !== undefined" class="pi" :class="slotProps.node.data.disabled === false ? 'color-green pi-check' : 'color-red pi-times'" />
          </template>
        </Column>
        <Column field="name" :header="$t('general.name')" sortable expander style="width: 26%"></Column>
        <Column field="unit" :header="$t('general.unit')" style="width: 8%"></Column>
        <Column field="deviceSource" :header="$t('general.deviceSource')" style="width: 8%"></Column>
        <Column field="lastData" :header="$t('general.lastdata')" style="width: 8%"></Column>
        <Column field="shared" :header="$t('general.shared')" style="width: 1%">
          <template #body="rowProps">
            <i v-if="rowProps.node.data.type === 'sensor'" class="pi" :class="rowProps.node.data.shared === 0 ? 'color-red pi-times' : (rowProps.node.data.shared === 1 ? 'color-orange pi-check' : 'color-green pi-check')" />
          </template>
        </Column>
        <Column field="created" :header="$t('general.created')" style="width: 8%"></Column>
        <Column field="updated" :header="$t('general.updated')" style="width: 8%"></Column>
        <Column field="valueChange" :header="$t('general.valueChange')" style="width: 9%"></Column>
        <Column style="width: 12%">
          <template #body="rowProps">
            <div v-if="rowProps.node.data.type === 'sensor' && rowProps.node.key !== userid" class="flex flex-wrap gap-2">
              <Button type="button" icon="pi pi-cloud-upload" rounded severity="help" @click="openInsertMeasurement(rowProps.node)" />
              <Button type="button" icon="pi pi-pencil" rounded severity="info" @click="displayAddEditSensor(rowProps.node, 'edit')" />
              <Button type="button" icon="pi pi-trash" rounded severity="danger" @click="deleteSensor(rowProps.node)" />
            </div>
            <div v-if="rowProps.node.data.type === 'organisation'" class="flex flex-wrap gap-2">
              <Button type="button" icon="pi pi-plus" rounded severity="success" @click="displayAddEditSensor(rowProps.node, 'add')" />
            </div>
          </template>
        </Column>
        <template #footer>
          <div class="flex justify-start">
            <Button icon="pi pi-refresh" :label="$t('buttons.reload')" severity="warn" @click="getSensors()"/>
          </div>
        </template>
        
      </TreeTable>
    </div>
    <div v-else-if="pageStatus === 2">
      <ErrorRetry @reload="getSensors()" :absolute="true"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { SensorsList, SensorListSensor } from '../services/Interfaces';
import { useI18n } from 'vue-i18n';
import { AppSettings } from '../services/Settings';
import { FormatDate, GetURLHeader } from '../services/Utils';
import { Column, DatePicker, Dialog, InputNumber, InputNumberInputEvent, InputText, SelectButton, ToggleButton, Tree, TreeTable } from 'primevue';
import { Form, FormField } from '@primevue/forms';
import z from 'zod';
import { toastShow } from '../services/Toast';
import { StorageGet } from '../services/Storage';
import { dialogShow } from '../services/Dialog';
import ErrorRetry from '../components/ErrorRetry.vue';
import Loader from '../components/Loader.vue';

const { t } = useI18n();

const expandedKeys = ref(); // TreeTable expanded keys
const sources = ref([]); // Available sensor sources
const selectedSource = ref(); // Selected sensor source

const addEditDialog = ref<{ // Dialog for adding/editing sensors
  active: boolean;
  data: { deviceSource: string; disabled: boolean; name: string; org: string; orgName: string; shared: number; unit: string, valueChange: number };
  error: { timeout: number | ReturnType<typeof setTimeout> | null; message: string };
}>({ active: false, data: { deviceSource: '', disabled: false, name: '', org: '', orgName: '', shared: 0, unit: '', valueChange: 1 }, error: { timeout: null, message: '' } });
const addEditUserDialog = ref(); // Reference to the add/edit dialog component
const insertMeasurementDialog = ref();
const insertMeasurementData = ref({
  active: false,
  data: { date: null, maxDate: new Date(), measurement: null, sensorId: '', sensorName: '' }
}); // Reference to the insert measurement dialog component

const datalist = ref<SensorsList[]>([]); // Sensor data list
const pageStatus = ref(0); // Page status (0: loading, 1: loaded, 2: error)
const selected =  { dialog: '', org: '', sensor: '', type: '' }; // Selected sensor/org for add/edit
const sharedOptions = ref([
  { label: 'general.private', value: 0, icon: 'pi pi-times color-red' },
  { label: 'general.shareddesc', value: 1, icon: 'pi pi-check color-orange' },
  { label: 'general.public', value: 2, icon: 'pi pi-check color-green' }
]);

const userid = StorageGet('userid'); // Current user ID

const formResolver = z.object({ // Form validation schema
  name: z
    .string()
    .min(1, 'name_too_short')
    .max(AppSettings.inputMax.organisation, 'name_too_long')
});

onMounted(() => {
  getSensors(); // Then fetch users
});

/**
 * Delete a sensor
 * @param rowdata Sensor data to delete
 */
const deleteSensor = (rowdata: SensorListSensor): void => {
  dialogShow({
    group: 'dialogconfirm',
    header: t('general.remove'),
    message: t('dialog.remove_sensor', { sensor: rowdata.data.name }),
    rejectProps: {
      label: 'Cancel',
      icon: 'pi pi-times',
      outlined: true,
      size: 'small'
    },
    acceptProps: {
      label: 'Confirm',
      icon: 'pi pi-check',
      size: 'small'
    },
    accept: () => {
      const apiUrl = `${AppSettings.env.API_URL}/sensor/${rowdata.data.organisationId}/${rowdata.key}`;
      axios
        .delete(apiUrl, {
          headers: GetURLHeader()
        })
        .then(() => {
          toastShow(t('pages.settings.sensors.title'), t('toast.sensors_delete_ok'), 'success');
          const sensors = datalist.value.find(o => { return o.key === rowdata.data.organisationId });
          if (sensors !== undefined) {
            for (let u in sensors?.children) {
              if (sensors.children[u].key === rowdata.key) {
                sensors.children.splice(parseInt(u), 1);
                break;
              }
            }
          }
        })
        .catch((error) => {
          toastShow(t('pages.settings.sensors.title'), t('toast.sensors_delete_fail'), 'error');
        });
    },
    reject: () => {}
  });
}

/**
 * Display the add/edit sensor dialog
 * @param rowdata Sensor data
 * @param type Dialog type ('add' | 'edit')
 */
const displayAddEditSensor = (rowdata: SensorListSensor, type: 'add' | 'edit'): void => {
  switch (type)
  {
    case 'add': {
      addEditDialog.value.data.deviceSource = rowdata.data.deviceSource;
      addEditDialog.value.data.disabled = false;
      addEditDialog.value.data.name = '';
      addEditDialog.value.data.orgName = rowdata.data.name;
      addEditDialog.value.data.shared = 0;
      addEditDialog.value.data.unit = '';
      addEditDialog.value.data.valueChange = 1;
      
      expandedKeys.value = {};
      selectedSource.value = {};
      selected.dialog = 'add';
      selected.org = rowdata.key;
      break;
    }
    case 'edit': {
      addEditDialog.value.data.deviceSource = rowdata.data.deviceSource;
      addEditDialog.value.data.disabled = rowdata.data.disabled;
      addEditDialog.value.data.name = rowdata.data.name;
      addEditDialog.value.data.orgName = rowdata.data.organisation;
      addEditDialog.value.data.shared = rowdata.data.shared;
      addEditDialog.value.data.unit = rowdata.data.unit;
      addEditDialog.value.data.valueChange = rowdata.data.valueChange;

      const expandkeys: string[] = rowdata.data.source.split('.');
      const expand: any = {};
      expand[expandkeys[0]] = true;
      expand[expandkeys[1]] = true;
      expandedKeys.value = expand;

      const source: any = {};
      source[rowdata.data.source] = true;
      selectedSource.value = source;

      selected.dialog = 'edit';
      selected.org = rowdata.data.organisationId;
      selected.sensor = rowdata.key;
      break;
    }
    default: { return; }
  }
  
  selected.type = type;
  
  addEditDialog.value.active = true;
  return;
}

/**
 * Display an error message
 * @param type Dialog type ('add' | 'edit')
 * @param key Error message key
 */
const displayError = (type: 'add' | 'edit', key: string): void => {
  let source: any = null;
  switch (type) {
    case 'add': { source = null; break; }
    case 'edit': { source = addEditDialog; break; }
  }
  if (source.value.error.timeout !== null) { clearTimeout(source.value.error.timeout); }
  source.value.error.message = key;
  source.value.error.timeout = setTimeout(() => { source.value.error.timeout = null; }, 3000);
};

/**
 * Edit or add a sensor
 * @param formData Form data to submit
 */
const editAddSensor = (formData: any): void => {
  try {
    formResolver.parse(formData.values);
  } catch(error){
    if(error instanceof z.ZodError) {
      for (const e of error.issues) {
        displayError('edit', e.message);
      }
    }
    return;
  }

  // Sensor selection check
  const sourceKey = Object.keys(selectedSource.value);
  if ((sourceKey.length !== 1) || (sourceKey[0].split('.').length !== 2)) {
    displayError('edit', 'invalid_sensor_selected');
    return;
  }
  
  const apiUrl = `${AppSettings.env.API_URL}/sensor`;
  switch (selected.type)
  {
    case 'add': {
      axios
        .put(`${apiUrl}/add/${selected.org}`, {
          deviceSource: addEditDialog.value.data.deviceSource ?? '',
          disabled: addEditDialog.value.data.disabled,
          name: addEditDialog.value.data.name,
          shared: addEditDialog.value.data.shared,
          source: sourceKey[0],
          unit: addEditDialog.value.data.unit,
          valueChange: addEditDialog.value.data.valueChange
        }, {
          headers: GetURLHeader()
        })
        .then((response) => {
          addEditUserDialog.value.close();
          toastShow(t('pages.settings.sensors.title'), t('toast.sensors_add_ok'), 'success');
          getSensors();
        })
        .catch((error) => {
          toastShow(t('pages.settings.sensors.title'), t('toast.sensors_add_fail'), 'error');
        });
      break;
    }
    case 'edit': {
      axios
        .put(`${apiUrl}/edit/${selected.org}/${selected.sensor}`, {
          deviceSource: addEditDialog.value.data.deviceSource ?? '',
          disabled: addEditDialog.value.data.disabled,
          name: addEditDialog.value.data.name,
          shared: addEditDialog.value.data.shared,
          source: sourceKey[0],
          unit: addEditDialog.value.data.unit,
          valueChange: addEditDialog.value.data.valueChange
        }, {
          headers: GetURLHeader()
        })
        .then((response) => {
          toastShow(t('pages.settings.sensors.title'), t('toast.sensors_edit_ok'), 'success');
          addEditUserDialog.value.close();

          const org = datalist.value.find((o) => { return o.key === selected.org });
          const sensor = org?.children.find((u: any) => { return u.key === selected.sensor });
          sensor.data.deviceSource = addEditDialog.value.data.deviceSource;
          sensor.data.disabled = addEditDialog.value.data.disabled;
          sensor.data.name = addEditDialog.value.data.name;
          sensor.data.source = sourceKey[0];
          sensor.data.unit = addEditDialog.value.data.unit;
          sensor.data.valueChange = addEditDialog.value.data.valueChange;
        })
        .catch((error) => { toastShow(t('pages.settings.sensors.title'), t('toast.sensors_edit_fail'), 'error'); });
      break;
    }
  }
}

/**
 * Fetch the sensors list
 */
const getSensors = async (): Promise<void> => {
  try {
    datalist.value = [];
    pageStatus.value = 0;
    const response = await axios.get(`${AppSettings.env.API_URL}/sensor`, { headers: GetURLHeader() });
    for (const org of response.data.organisations) {
      const children: any = [];
      for (const sensor of org.sensors) {
        children.push({
          key: sensor.id,
          data: {
            created: FormatDate(sensor.created, true, true),
            deviceSource: sensor.deviceSource,
            disabled: sensor.disabled,
            lastData: FormatDate(sensor.lastData, true, true),
            name: sensor.name,
            organisationId: org.id,
            organisation: org.name,
            shared: sensor.shared,
            source: sensor.source,
            type: 'sensor',
            unit: sensor.unit,
            updated: FormatDate(sensor.updated, true, true),
            valueChange: sensor.valueChange
          }
        });
      }

      const datarow = {
        children,
        data: { id: org.id, name: org.name, type: 'organisation' },
        key: org.id
      };

      datalist.value.push(datarow);
    }

    const srcs: any = [];
    for (const src of response.data.sources) {
      let org = srcs.find((o: any) => { return o.key === src.source0 });
      if (org === undefined) {
        let slabel = '?';
        try {
          const sn = response.data.sourcesName.find((s: any) => { return s.id === src.source0 });
          if (sn !== undefined) { slabel = sn.name; }
        } catch (error) {}
        org = {
          key: src.source0,
          label: slabel,
          icon: 'pi pi-fw pi-building',
          children: []
        };
        srcs.push(org);
      }

      let snr = org.children.find((s: any) => { return s.key === src.source1 });
      if (snr === undefined) {
        snr = {
          key: src.source0 + '.' + src.source1,
          label: src.source1,
          icon: 'pi pi-fw pi-wave-pulse',
          children: []
        };
        org.children.push(snr);
      }
    }
    sources.value = srcs;
    pageStatus.value = 1;
  } catch (error) {
    pageStatus.value = 2;
    toastShow(t('pages.settings.sensors.title'), t('toast.sensors_load_fail'), 'error');
  }
}

const insertSensorMeasurement = (): void => {
  const apiUrl = `${AppSettings.env.API_URL}/measurements/save/${insertMeasurementData.value.data.sensorId}`;
  axios
    .post(apiUrl, {
      date: insertMeasurementData.value.data.date,
      value: insertMeasurementData.value.data.measurement
    }, {
      headers: GetURLHeader()
    })
    .then((response) => {
      toastShow(t('pages.settings.sensors.title'), t('toast.sensors_insert_measurement_ok'), 'success');
      insertMeasurementDialog.value.close();
    })
    .catch((error) => {
      toastShow(t('pages.settings.sensors.title'), t('toast.sensors_insert_measurement_fail'), 'error');
    });
}

const openInsertMeasurement = (rowdata: SensorListSensor): void => {
  insertMeasurementData.value.data.date = null;
  insertMeasurementData.value.data.measurement = null;
  insertMeasurementData.value.data.sensorId = rowdata.key;
  insertMeasurementData.value.data.sensorName = rowdata.data.name;
  insertMeasurementData.value.active = true;
}

const refocusInput = ($event: InputNumberInputEvent): void => {
  const target = $event.originalEvent.target as HTMLElement;
  target.blur();
  target.focus();
}
</script>

<style scoped>
.add-button {
  background-color: #4caf50; /* Green */
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
  margin-bottom: 10px;
}

.add-button:hover { background-color: #45a049; }

.delete-button {
  background-color: #f44336; /* Red */
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
}

.delete-button:hover { background-color: #d32f2f; }

.disabledRow {
  background-color: #f9d6d5;
  color: #a1a1a1;
}

.edit-button {
  background-color: #faf6f6; /* Blue */
  color: black;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
}

.edit-button:hover { background-color: rgb(199, 195, 195); }

.selected-option {
  width: 100%;
  height: 100%;
  background-color: var(--color-black);
  opacity: 0.15;
  position: absolute;
}

.source-tree-container {
  height: 25em;
  overflow: auto;
}
</style>
