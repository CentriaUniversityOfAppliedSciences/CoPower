<template>
  <div class="full-screen-relative">
    <Dialog ref="addNewAPIDialog" v-model:visible="addNewDialog.active" modal :header="$t('general.add')" :style="{ width: '25rem' }">
      <Form v-slot="$form" :initialValues="{ disabled: false, name: '' }" @submit="addAPIKey" class="flex flex-col gap-4 w-full">
        <div class="flex items-center gap-4 mb-8">
          <FormField v-slot="$field" name="type" initialValue="" class="flex flex-col gap-1 width-100">
            <label for="type">{{ $t('general.organisation') }}</label>
            <Select v-model="addNewDialog.data.org" inputId="type" :options="orgList" optionLabel="name" optionValue="id" class="w-full md:w-56" />
          </FormField>
        </div>
        <div class="flex justify-end gap-2">
          <Button type="button" :label="$t('buttons.cancel')" severity="secondary" @click="addNewDialog.active = false"></Button>
          <Button :label="$t('buttons.save')" type="submit" :disabled="addNewDialog.data.org == ''"></Button>
        </div>
      </Form>
    </Dialog>
    
    <div v-if="pageStatus === 0">
      <Loader :absolute="true"/>
    </div>
    <div v-else-if="pageStatus === 1" class="card">
      <TreeTable :value="APIdata" tableStyle="min-width: 50rem" removableSort>
        <template #header>
          <div class="text-xl font-bold">{{ $t('pages.settings.api.title') }}</div>
        </template>
        <Column field="disabled" style="width: 4%">
          <template #body="slotProps">
            <i class="pi" :class="slotProps.node.data.active === true ? 'color-green pi-check' : 'color-red pi-times'" />
          </template>
        </Column>
        <Column field="id" :header="$t('pages.settings.api.apikey')" style="width: 24%"></Column>
        <Column v-if="userRole == 'appadmin'" field="organisation" :header="$t('general.organisation')" sortable style="width: 16%"></Column>
        <Column field="lastUsed" :header="$t('pages.settings.api.lastused')" style="width: 14%"></Column>
        <Column field="created" :header="$t('general.created')" style="width: 14%"></Column>
        <Column field="creator" :header="$t('general.creator')" style="width: 14%"></Column>
        <Column style="width: 18%">
          <template #body="rowProps">
            <div class="flex flex-wrap gap-2">
              <Button type="button" icon="pi pi-trash" rounded severity="danger" @click="deleteAPIkey(rowProps.node)" />
            </div>
          </template>
        </Column>
        <template #footer>
          <div class="flex justify-start">
            <Button class="margin-right" icon="pi pi-plus" :label="$t('buttons.addnew')" severity="success" @click="openaddNewAPIDialog()" />
            <Button icon="pi pi-refresh" :label="$t('buttons.reload')" severity="warn" @click="getAPIList()" />
          </div>
        </template>
      </TreeTable>
    </div>
    <div v-else-if="pageStatus === 2">
      <ErrorRetry @reload="getAPIList()" :absolute="true"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { AppSettings } from '../services/Settings';
import { APIList, APIOrganisationList } from '../services/Interfaces';
import { useI18n } from 'vue-i18n';
import { dialogShow } from '../services/Dialog';
import { FormatDate, GetURLHeader } from '../services/Utils';
import { toastShow } from '../services/Toast';
import ErrorRetry from '../components/ErrorRetry.vue';
import Loader from '../components/Loader.vue';

import { Form, FormField } from '@primevue/forms';
import { Column, Dialog, InputText, Select, ToggleButton, TreeTable } from 'primevue';
import { StorageGet } from '../services/Storage';

const { t } = useI18n();

const addNewDialog = ref<{ // Add new organisation dialog state
  active: boolean; 
  data: { org: string; };
  error: { timeout: number | ReturnType<typeof setTimeout> | null; message: string } 
}>({ active: false, data: { org: '' }, error: { timeout: null, message: '' } });
const addNewAPIDialog = ref(); // Reference to Add New Organisation Dialog

const APIdata = ref<APIList[]>([]); // Organisation list array
const orgList = ref<APIOrganisationList[]>([]); // Organisation list
const pageStatus = ref(0); // Page status (0: loading, 1: loaded, 2: error)
const userRole = ref(''); // User role

onMounted(() => {
  userRole.value = StorageGet('role') || '';
  if (userRole.value === 'appadmin') {
    getInit();
  } else { getAPIList(); }
});

/**
 * Add a new API key
 * @param formData Form data for the new API key
 */
const addAPIKey = (formData: any = null): void => {
  let apiUrl = '';
  if (userRole.value === 'appadmin') {
    apiUrl = `${AppSettings.env.API_URL}/api/add/${addNewDialog.value.data.org}`;
  } else { apiUrl = `${AppSettings.env.API_URL}/api/add`; }
  axios
    .post(apiUrl, {}, { headers: GetURLHeader() })
    .then((response) => {
      addNewAPIDialog.value.close();
      getAPIList();
      toastShow(t('pages.settings.api.title'), t('toast.api_add_ok'), 'success');
    })
    .catch((error) => {
      toastShow(t('pages.settings.api.title'), t('toast.api_add_fail'), 'error');
    });
}

/**
 * Delete an API key
 * @param org API key to delete
 */
const deleteAPIkey = (org: APIList): void => {
  dialogShow({
    group: 'dialogconfirm',
    header: t('general.remove'),
    message: t('dialog.remove_apikey', { organisation: org.data.id }),
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
      const apiUrl = `${AppSettings.env.API_URL}/api/delete/${org.data.id}`;
      axios
        .delete(apiUrl, { params: {}, headers: GetURLHeader() })
        .then(() => {
          toastShow(t('pages.settings.api.title'), t('toast.api_delete_ok'), 'success');
          getAPIList();
        })
        .catch((error) => {
          toastShow(t('pages.settings.api.title'), t('toast.api_delete_fail'), 'error');
        });
    },
    reject: () => {}
  });
}

/**
 * Display an error message
 * @param key Error message key
 */
const displayError = (key: string): void => {
  if (addNewDialog.value.error.timeout !== null) { clearTimeout(addNewDialog.value.error.timeout); }
  addNewDialog.value.error.message = key;
  addNewDialog.value.error.timeout = setTimeout(() => { addNewDialog.value.error.timeout = null; }, 3000);
};

const getInit = async (): Promise<void> => {
  try {
    const response = await axios.get(`${AppSettings.env.API_URL}/api/init`, { headers: GetURLHeader() });
    orgList.value = response.data;
    getAPIList();
  } catch (error) {
    pageStatus.value = 3;
  }
}

/**
 * Fetch the list of organisations from the API
 */
const getAPIList = async (): Promise<void> => {
  try {
    pageStatus.value = 0;
    const response = await axios.get(`${AppSettings.env.API_URL}/api/list`, { headers: GetURLHeader() });
    APIdata.value = [];
    for (const org in response.data) {
      const data = response.data[org];
      APIdata.value.push({
        children: [],
        data: { active: data.active, created: FormatDate(data.created, true, true), creator: data.creator, id: data.id, lastUsed: data.lastUsed !== null ? FormatDate(data.lastUsed, true, true) : '', organisation: data.organisation, organisationId: data.organisationId },
        key: org
      });
    }
    pageStatus.value = 1;
  } catch (error) {
    pageStatus.value = 2;
  };
}

/**
 * Open the dialog to add a new API key. If the user is not an app admin, show a confirmation dialog instead.
 */
const openaddNewAPIDialog = (): void => {
  if (userRole.value === 'appadmin') {
    addNewDialog.value.active = true;
    addNewDialog.value.data.org = '';
  } else {
    dialogShow({
      group: 'dialogconfirm',
      header: t('dialog.addapi'),
      message: t('dialog.addapi_message'),
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
        addAPIKey();
      },
      reject: () => {}
    });
  }
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
}
.add-button:hover {
  background-color: #45a049;
}

.delete-button {
  background-color: #f44336; /* Red */
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
}
.delete-button:hover {
  background-color: #d32f2f;
}

.disabledRow {
  background-color: #f9d6d5;
  color: #a1a1a1;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th { text-align: left; }

th, td {
  border: 1px solid #ddd;
  padding: 8px;
}
</style>
