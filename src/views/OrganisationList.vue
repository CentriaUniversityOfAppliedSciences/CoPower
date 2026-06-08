<template>
  <div class="full-screen-relative">
    <Dialog ref="addNewOrganisationDialog" v-model:visible="addNewDialog.active" modal :header="$t('general.add')" :style="{ width: '25rem' }">
      <Form v-slot="$form" :initialValues="{ disabled: false, name: '', status: true, type: null }" @submit="addOrganisation" class="flex flex-col gap-4 w-full">
        <div class="flex items-center gap-4 mb-4">
          <FormField v-slot="$field" name="name" initialValue="" class="flex flex-col gap-1 width-100">
            <label for="name" class="font-semibold w-24">{{ t('general.name') }}</label>
            <InputText v-model="addNewDialog.data.name" id="name" class="flex-auto" autocomplete="off" maxlength="40" />
            <label class="form-error-message" v-if="addNewDialog.error.timeout !== null">{{ t('validation.' + addNewDialog.error.message)}}</label>
          </FormField>
        </div>
        <div class="flex items-center gap-4 mb-8">
          <FormField v-slot="$field" name="type" initialValue="" class="flex flex-col gap-1 width-100">
            <label for="type">{{ $t('pages.organisation.orgType') }}</label>
            <Select v-model="addNewDialog.data.type" inputId="type" :options="orgTypes" optionLabel="name" optionValue="id" class="w-full md:w-56" />
          </FormField>
        </div>
        <div class="flex items-center gap-4 mb-8">
          <FormField v-slot="$field" name="status" :initialValue="false" class="flex flex-col gap-1 width-100">
            <label for="status" class="font-semibold w-24">{{ t('general.status') }}</label>
            <ToggleButton id="status" v-model="addNewDialog.data.disabled" :onLabel="$t('general.deactivated')" :offLabel="$t('general.activated')" />
          </FormField>
        </div>
        <div class="flex justify-end gap-2">
          <Button type="button" :label="$t('buttons.cancel')" severity="secondary" @click="addNewDialog.active = false"></Button>
          <Button :label="$t('buttons.save')" type="submit"></Button>
        </div>
      </Form>
    </Dialog>

    <Dialog ref="editOrganisationDialog" v-model:visible="editDialog.active" modal :header="$t('general.edit')" :style="{ width: '25rem' }">
      <Form v-slot="$form" :initialValues="{ disabled: false, name: editDialog.data.name }" @submit="editOrganisation" class="flex flex-col gap-4 w-full">
        <div class="flex items-center gap-4 mb-4">
          <FormField v-slot="$field" name="name" :initialValue="editDialog.data.name" class="flex flex-col gap-1 width-100">
            <label for="name" class="font-semibold w-24">{{ t('general.name') }}</label>
            <InputText v-model="editDialog.data.name" id="name" class="flex-auto" autocomplete="off" maxlength="40" />
            <label class="form-error-message" v-if="editDialog.error.timeout !== null">{{ t('errors.organisation.' + editDialog.error.message)}}</label>
          </FormField>
        </div>
        <FormField v-slot="$field" name="id" initialValue="" class="flex flex-col gap-1 width-100">
          <label for="type">{{ $t('pages.organisation.orgType') }}</label>
          <Select v-model="editDialog.data.type" inputId="type" :options="orgTypes" optionLabel="name" optionValue="id" class="w-full md:w-56" />
        </FormField>
        <div class="flex items-center gap-4 mb-8">
          <FormField v-slot="$field" name="status" :initialValue="false" class="flex flex-col gap-1 width-100">
            <label for="status" class="font-semibold w-24">{{ t('general.status') }}</label>
            <ToggleButton id="status" v-model="editDialog.data.disabled" :onLabel="$t('general.deactivated')" :offLabel="$t('general.activated')" />
          </FormField>
        </div>
        <div class="flex justify-end gap-2">
          <Button type="button" :label="$t('buttons.cancel')" severity="secondary" @click="editDialog.active = false"></Button>
          <Button :label="$t('buttons.save')" type="submit"></Button>
        </div>
      </Form>
    </Dialog>
    
    <div v-if="pageStatus === 0">
      <Loader :absolute="true"/>
    </div>
    <div v-else-if="pageStatus === 1" class="card">
      <TreeTable :value="organisationList" tableStyle="min-width: 50rem" removableSort>
        <template #header>
          <div class="text-xl font-bold">{{ $t('pages.settings.organisations.title') }}</div>
        </template>
        <Column field="disabled" style="width: 4%">
          <template #body="slotProps">
            <i class="pi" :class="slotProps.node.data.disabled === false ? 'color-green pi-check' : 'color-red pi-times'" />
          </template>
        </Column>
        <Column field="name" :header="$t('general.name')" sortable style="width: 20%"></Column>
        <Column field="type" :header="$t('general.type')" style="width: 10%">
          <template #body="rowProps">
            <span>{{ orgTypes.find((t) => t.id === rowProps.node.data.type)?.name || $t('general.unknown') }}</span>
          </template>
        </Column>
        <Column field="id" :header="$t('general.id')" style="width: 24%"></Column>
        <Column field="created" :header="$t('general.created')" style="width: 14%"></Column>
        <Column field="updated" :header="$t('general.updated')" style="width: 14%"></Column>
        <Column style="width: 18%">
          <template #body="rowProps">
            <div class="flex flex-wrap gap-2">
              <Button type="button" icon="pi pi-pencil" rounded severity="success" @click="displayEditOrganisation(rowProps.node)" />
              <Button type="button" icon="pi pi-trash" rounded severity="danger" @click="deleteOrganisation(rowProps.node)" />
            </div>
          </template>
        </Column>
        <template #footer>
          <div class="flex justify-start">
            <Button class="margin-right" icon="pi pi-plus" :label="$t('buttons.addnew')" severity="success" @click="openAddNewOrganisationDialog()" />
            <Button icon="pi pi-refresh" :label="$t('buttons.reload')" severity="warn" @click="getOrganisations()" />
          </div>
        </template>
      </TreeTable>
    </div>
    <div v-else-if="pageStatus === 2">
      <ErrorRetry @reload="getOrganisations()" :absolute="true"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { AppSettings } from '../services/Settings';
import { OrganisationList } from '../services/Interfaces';
import { useI18n } from 'vue-i18n';
import { dialogShow } from '../services/Dialog';
import z from 'zod';
import { FormatDate, GetURLHeader } from '../services/Utils';
import { toastShow } from '../services/Toast';
import ErrorRetry from '../components/ErrorRetry.vue';
import Loader from '../components/Loader.vue';

import { Form, FormField } from '@primevue/forms';
import { Column, Dialog, InputText, Select, ToggleButton, TreeTable } from 'primevue';

const { t } = useI18n();

interface OrganisationType {
  id: number;
  name: string;
}

const addNewDialog = ref<{ // Add new organisation dialog state
  active: boolean; 
  data: { disabled: boolean; name: string; type: number | null };
  error: { timeout: number | ReturnType<typeof setTimeout> | null; message: string } 
}>({ active: false, data: { disabled: false, name: '', type: null }, error: { timeout: null, message: '' } });
const addNewOrganisationDialog = ref(); // Reference to Add New Organisation Dialog

const editDialog = ref<{ // Edit organisation dialog state
  active: boolean; 
  data: { disabled: boolean; id: string, name: string, type: number | null };
  error: { timeout: number | ReturnType<typeof setTimeout> | null; message: string } 
}>({ active: false, data: { disabled: false, id: '', name: '', type: null }, error: { timeout: null, message: '' } });
const editOrganisationDialog = ref(); // Reference to Edit Organisation Dialog
const organisationList = ref<OrganisationList[]>([]); // Organisation list array
const orgTypes = ref<OrganisationType[]>([]); // Organisation types
const pageStatus = ref(0); // Page status (0: loading, 1: loaded, 2: error)

const formResolver = z.object({ // Form validation schema
  name: z
    .string()
    .min(1, 'organisation_too_short')
    .max(AppSettings.inputMax.organisation, 'name_too_long'),
});

onMounted(() => {
  getInit();
});

/**
 * Add a new organisation
 * @param formData Form data for the new organisation
 */
const addOrganisation = (formData: any): void => {
  try {
    formResolver.parse(formData.values);
  } catch(error){
    if(error instanceof z.ZodError) {
      displayError(error.issues[0].message);
    }
    return;
  }

  const apiUrl = `${AppSettings.env.API_URL}/organisation/add`;
  axios
    .post(apiUrl, {
      disabled: addNewDialog.value.data.disabled,
      name: addNewDialog.value.data.name,
      type: addNewDialog.value.data.type
    }, {
      headers: GetURLHeader()
    })
    .then((response) => {
      addNewOrganisationDialog.value.close();
      getOrganisations();
      toastShow(t('pages.settings.organisations.title'), t('toast.organisation_add_ok'), 'success');
    })
    .catch((error) => {
      toastShow(t('pages.settings.organisations.title'), t('toast.organisation_add_fail'), 'error');
    });
}

/**
 * Delete an organisation
 * @param org Organisation to delete
 */
const deleteOrganisation = (org: OrganisationList): void => {
  dialogShow({
    group: 'dialogconfirm',
    header: t('general.remove'),
    message: t('dialog.remove_organisation', { organisation: org.data.name }),
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
      const apiUrl = `${AppSettings.env.API_URL}/organisation/delete`;
      axios
        .delete(apiUrl, {
          params: {
            org: org.data.id
          },
          headers: GetURLHeader()
        })
        .then(() => {
          toastShow(t('pages.settings.organisations.title'), t('toast.organisation_delete_ok'), 'success');
          getOrganisations();
        })
        .catch((error) => {
          toastShow(t('pages.settings.organisations.title'), t('toast.organisation_delete_fail'), 'error');
      });
    },
    reject: () => {}
  });
}

/**
 * Display the edit organisation dialog
 * @param org Organisation to edit
 */
const displayEditOrganisation = (org: OrganisationList): void => {
  editDialog.value.data.disabled = org.data.disabled;
  editDialog.value.data.id = org.data.id;
  editDialog.value.data.name = org.data.name;
  editDialog.value.data.type = org.data.type;
  editDialog.value.active = true;
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

/**
 * Edit an organisation
 */
const editOrganisation = (): void => {
  const apiUrl = `${AppSettings.env.API_URL}/organisation/edit`;

  editOrganisationDialog.value.close();
  axios
    .put(apiUrl, {
      disabled: editDialog.value.data.disabled,
      id: editDialog.value.data.id,
      name: editDialog.value.data.name,
      type: editDialog.value.data.type
    }, {
      headers: GetURLHeader()
    })
    .then((response) => {
      toastShow(t('pages.settings.organisations.title'), t('toast.organisation_edit_ok'), 'success');
      getOrganisations();
    })
    .catch((error) => { toastShow(t('pages.settings.organisations.title'), t('toast.organisation_edit_fail'), 'error'); });
}

const getInit = async (): Promise<void> => {
  try {
    const response = await axios.get(`${AppSettings.env.API_URL}/organisation/init`, { headers: GetURLHeader() });
    const orgTypeData = [
      { id: 0, name: 'Admin' }
    ];
    for (const orgType in response.data) {
      const data = response.data[orgType];
      orgTypeData.push({ id: data.id, name: data.name });
    }
    orgTypes.value = orgTypeData;
    getOrganisations();
  } catch (error) {
    pageStatus.value = 3;
  }
}

/**
 * Fetch the list of organisations from the API
 */
const getOrganisations = async (): Promise<void> => {
  try {
    pageStatus.value = 0;
    organisationList.value = [];
    const response = await axios.get(`${AppSettings.env.API_URL}/organisation/list`, { headers: GetURLHeader() });
    const rows = response.data;
    for (const org in rows) {
      const data = rows[org];
      organisationList.value.push({
        children: [],
        data: { created: FormatDate(data.created, true, true), disabled: data.disabled, id: data.id, name: data.name, type: data.type, updated: data.updated !== null ? FormatDate(data.updated, true, true) : '' },
        key: org
      });
    }
    pageStatus.value = 1;
  } catch (error) {
    pageStatus.value = 2;
  };
}

/**
 * Open the add new organisation dialog and reset the form data
 */
const openAddNewOrganisationDialog = (): void => {
  addNewDialog.value.active = true;
  addNewDialog.value.data.disabled = false;
  addNewDialog.value.data.name = '';
  addNewDialog.value.data.type = null;
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
