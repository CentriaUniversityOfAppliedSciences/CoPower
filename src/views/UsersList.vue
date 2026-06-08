<template>
  <div class="full-screen-relative">
    <Dialog ref="addEditUserDialog" v-model:visible="addEditDialog.active" :validateOnValueUpdate="true" :validateOnBlur="true" :validateOnMount="['email', 'name']" modal :header="$t('general.' + selected.dialog)" :style="{ width: '25rem' }">
      <Form v-slot="$form" :initialValues="{ access: '', disabled: false, email: '', name: addEditDialog.data.name, organisation: '' }" @submit="editAddUser" class="flex flex-col gap-4 w-full">
        <div class="flex items-center gap-4 mb-4">
          <FormField v-slot="$field" name="name" :initialValue="addEditDialog.data.organisation" class="flex flex-col gap-1 width-100">
            <label class="font-semibold w-24 width-100">{{ t('general.organisation') }}</label>
            <span>{{ addEditDialog.data.organisation }}</span>
          </FormField>
        </div>
        <div class="flex items-center gap-4 mb-4">
          <FormField v-slot="$field" name="name" :initialValue="addEditDialog.data.name" class="flex flex-col gap-1 width-100">
            <label for="name" class="font-semibold w-24 width-100">{{ t('general.name') }}</label>
            <InputText v-model="addEditDialog.data.name" type="text" id="name" class="flex-auto" autocomplete="off" :maxlength="AppSettings.inputMax.name" />
          </FormField>
        </div>
        <div class="flex items-center gap-4 mb-4">
          <FormField v-slot="$field" name="email" :initialValue="addEditDialog.data.email" class="flex flex-col gap-1 width-100">
            <label for="email" class="font-semibold w-24 width-100">{{ t('general.email') }}</label>
            <InputText v-model="addEditDialog.data.email" id="name" class="flex-auto" autocomplete="off" type="email" :maxlength="AppSettings.inputMax.email" />
          </FormField>
        </div>
        <div class="flex items-center gap-4 mb-4">
          <FormField v-slot="$field" name="access" :initialValue="addEditDialog.data.access" class="flex flex-col gap-1 width-100">
            <label for="access" class="font-semibold w-24 width-100">{{ t('general.access') }}</label>
            <Select v-model="addEditDialog.data.access" id="access" :options="accessLevels" optionLabel="name" optionValue="code" :placeholder="$t('general.access')" class="w-full md:w-56" />
          </FormField>
        </div>
        <div class="flex items-center gap-4">
          <FormField v-slot="$field" name="status" :initialValue="false" class="flex flex-col gap-1 width-100">
            <label for="status" class="font-semibold w-24 width-100">{{ t('general.status') }}</label>
            <ToggleButton id="status" v-model="addEditDialog.data.disabled" :onLabel="$t('general.deactivated')" :offLabel="$t('general.activated')" />
          </FormField>
        </div>
        <div class="flex items-center gap-4 mb-4">
          <label class="form-error-message" v-if="addEditDialog.error.timeout !== null">{{ t('validation.' + addEditDialog.error.message)}}</label>
        </div>
        <div class="flex justify-end gap-2">
          <Button type="button" :label="$t('buttons.cancel')" severity="secondary" @click="addEditDialog.active = false"></Button>
          <Button :label="$t('buttons.save')" type="submit"></Button>
        </div>
      </Form>
    </Dialog>

    <div v-if="pageStatus === 0">
      <Loader :absolute="true"/>
    </div>
    <div v-else-if="pageStatus === 1" class="card">
      <TreeTable :value="datalist" tableStyle="min-width: 50rem" removableSort>
        <template #header>
          <div class="text-xl font-bold">{{ $t('pages.settings.users.title') }}</div>
        </template>
        <Column field="disabled" header="" style="width: 2%">
          <template #body="slotProps">
            <i v-if="slotProps.node.data.disabled !== undefined" class="pi" :class="slotProps.node.data.disabled === false ? 'color-green pi-check' : 'color-red pi-times'" />
          </template>
        </Column>
        <Column field="name" :header="$t('general.name')" sortable expander style="width: 18%"></Column>
        <Column field="email" :header="$t('general.email')" style="width: 18%"></Column>
        <Column field="access" :header="$t('general.access')" style="width: 8%">
          <template #body="rowProps">
            <div v-if="rowProps.node.data.type === 'user'" class="flex flex-wrap gap-2">
              <span>{{ $t('access.' + rowProps.node.data.access) }}</span>
            </div>
          </template>
        </Column>
        <Column field="lastlogin" :header="$t('general.lastlogin')" style="width: 8%"></Column>
        <Column field="created" :header="$t('general.created')" style="width: 8%"></Column>
        <Column field="updated" :header="$t('general.updated')" style="width: 8%"></Column>
        <Column style="width: 10%">
          <template #body="rowProps">
            <div v-if="rowProps.node.data.type === 'user' && rowProps.node.key !== userid" class="flex flex-wrap gap-2">
              <Button type="button" icon="pi pi-pencil" rounded severity="info" @click="displayAddEditUser(rowProps.node, 'edit')" />
              <Button type="button" icon="pi pi-envelope" rounded severity="info" @click="resendInvitation(rowProps.node)" />
              <Button type="button" icon="pi pi-trash" rounded severity="danger" @click="deleteUser(rowProps.node)" />
            </div>
            <div v-if="rowProps.node.data.type === 'organisation'" class="flex flex-wrap gap-2">
              <Button type="button" icon="pi pi-plus" rounded severity="success" @click="displayAddEditUser(rowProps.node, 'add')" />
            </div>
          </template>
        </Column>
        <template #footer>
          <div class="flex justify-start">
            <Button icon="pi pi-refresh" :label="$t('buttons.reload')" severity="warn" @click="getUsers()"/>
          </div>
        </template>
      </TreeTable>
    </div>
    <div v-else-if="pageStatus === 2">
      <ErrorRetry @reload="getUsers()" :absolute="true"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { UserListUser, UsersList } from '../services/Interfaces.ts';
import { useI18n } from 'vue-i18n';
import { AppSettings } from '../services/Settings.ts';
import { FormatDate, GetURLHeader } from '../services/Utils.ts';
import { Column, Dialog, InputText, Select, ToggleButton, TreeTable } from 'primevue';
import { Form, FormField } from '@primevue/forms';
import z from 'zod';
import { toastShow } from '../services/Toast.ts';
import { StorageGet } from '../services/Storage.ts';
import { dialogShow } from '../services/Dialog.ts';
import ErrorRetry from '../components/ErrorRetry.vue';
import Loader from '../components/Loader.vue';

const { t } = useI18n();

const accessLevels = ref([ // Access level options
  { name: t('access.admin'), code: 'admin' },
  { name: t('access.user'), code: 'user' }
]);

const addEditDialog = ref<{ // Dialog for adding/editing users
  active: boolean; 
  data: { access: string; disabled: boolean; email: string; id: string, name: string, organisation: string };
  error: { timeout: number | ReturnType<typeof setTimeout> | null; message: string } 
}>({ active: false, data: { access: '', disabled: false, email: '', id: '', name: '', organisation: '' }, error: { timeout: null, message: '' } });
const addEditUserDialog = ref(); // Reference to the dialog component

const datalist = ref<UsersList[]>([]); // Data list for the TreeTable
const pageStatus = ref(0); // Page status (0: loading, 1: loaded, 2: error)
const selected =  { dialog: '', org: '', user: '', type: '' }; // Selected user/org for operations
const userid = StorageGet('userid'); // Current user ID

const formResolver = z.object({ // Form validation schema
  email: z
    .email('email_invalid'),
  name: z
    .string()
    .min(1, 'name_too_short')
    .max(AppSettings.inputMax.organisation, 'name_too_long')
});

onMounted(() => {
  getUsers(); // Then fetch users

  if (StorageGet('role') === 'appadmin') {
    accessLevels.value.unshift({ name: t('access.appadmin'), code: 'appadmin' });
  }
});

/**
 * Delete a user
 * @param rowdata User data to delete
 */
const deleteUser = (rowdata: UserListUser): void => {
  dialogShow({
    group: 'dialogconfirm',
    header: t('general.remove'),
    message: t('dialog.remove_user', { email: rowdata.data.email, user: rowdata.data.name }),
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
      const apiUrl = `${AppSettings.env.API_URL}/users/${rowdata.data.organisation}/${rowdata.key}`;
      axios
        .delete(apiUrl, {
          headers: GetURLHeader()
        })
        .then(() => {
          toastShow(t('pages.settings.users.title'), t('toast.users_delete_ok'), 'success');
          const users = datalist.value.find(o => { return o.key === rowdata.data.organisation });
          if (users !== undefined) {
            for (let u in users?.children) {
              if (users.children[u].key === rowdata.key) {
                users.children.splice(parseInt(u), 1);
                break;
              }
            }
          }
        })
        .catch((error) => {
          toastShow(t('pages.settings.users.title'), t('toast.users_delete_fail'), 'error');
        });
    },
    reject: () => {}
  });
}

/**
 * Display the add/edit user dialog
 * @param rowdata User data for the dialog
 * @param type Dialog type ('add' or 'edit')
 */
const displayAddEditUser = (rowdata: UserListUser, type: 'add' | 'edit'): void => {
  switch (type)
  {
    case 'add': {
      addEditDialog.value.data.access = 'user';
      addEditDialog.value.data.disabled = false;
      addEditDialog.value.data.email = '';
      addEditDialog.value.data.name = '';
      addEditDialog.value.data.organisation = rowdata.data.name;
      selected.dialog = 'add';
      selected.org = rowdata.key;
      break;
    }
    case 'edit': {
      addEditDialog.value.data.access = rowdata.data.access;
      addEditDialog.value.data.disabled = rowdata.data.disabled;
      addEditDialog.value.data.email = rowdata.data.email;
      addEditDialog.value.data.name = rowdata.data.name;
      addEditDialog.value.data.organisation = rowdata.data.name;
      selected.dialog = 'edit';
      selected.org = rowdata.data.organisation;
      selected.user = rowdata.key;
      
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
 * @param type Modal type ('add' | 'edit')
 * @param key Error message key
 */
const displayError = (type: 'add' | 'edit', key: string): void => {
  let source: any = null;
  switch (type) {
    case 'add': { source = null; break; }
    case 'edit': { source = addEditDialog; break; }
    default: { return; }
  }
  if (source.value.error.timeout !== null) { clearTimeout(source.value.error.timeout); }
  source.value.error.message = key;
  source.value.error.timeout = setTimeout(() => { source.value.error.timeout = null; }, 3000);
};

/**
 * Edit or add a user
 * @param formData Form data to submit
 */
const editAddUser = (formData: any): void => {
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

  const apiUrl = `${AppSettings.env.API_URL}/users`;
  
  switch (selected.type)
  {
    case 'add': {
      axios
        .put(`${apiUrl}/add/${selected.org}`, {
          access: addEditDialog.value.data.access,
          disabled: addEditDialog.value.data.disabled,
          email: addEditDialog.value.data.email,
          id: addEditDialog.value.data.id,
          name: addEditDialog.value.data.name
        }, {
          headers: GetURLHeader()
        })
        .then((response) => {
          toastShow(t('pages.settings.users.title'), t('toast.users_add_ok'), 'success');
          addEditDialog.value.active = false;
          getUsers();
        })
        .catch((error) => {
          var ecode = '';
          switch (error.response.data) {
            case 'AAUU178743': { ecode = 'errors.add_user.' + error.response.data; break; }
            default: { ecode = 'toast.users_add_fail'; }
          }
          toastShow(t('pages.settings.users.title'), t(ecode), 'error');
        });
      break;
    }
    case 'edit': {
      axios
        .put(`${apiUrl}/edit/${selected.org}/${selected.user}`, {
          access: addEditDialog.value.data.access,
          disabled: addEditDialog.value.data.disabled,
          email: addEditDialog.value.data.email,
          id: addEditDialog.value.data.id,
          name: addEditDialog.value.data.name
        }, {
          headers: GetURLHeader()
        })
        .then((response) => {
          toastShow(t('pages.settings.users.title'), t('toast.users_edit_ok'), 'success');
          addEditUserDialog.value.close();

          const org = datalist.value.find((o) => { return o.key === selected.org });
          const user = org?.children.find((u: any) => { return u.key === selected.user });
          user.data.access = addEditDialog.value.data.access;
          user.data.disabled = addEditDialog.value.data.disabled;
          user.data.email = addEditDialog.value.data.email;
          user.data.name = addEditDialog.value.data.name;
          //getOrganisations();
        })
        .catch((error) => { toastShow(t('pages.settings.users.title'), t('toast.users_edit_fail'), 'error'); });
      break;
    }
  }
}

/**
 * Fetch the users list
 */
const getUsers = async (): Promise<void> => {
  try {
    datalist.value = [];
    pageStatus.value = 0;

    const response = await axios.get(`${AppSettings.env.API_URL}/users`, {
      headers: GetURLHeader()
    });
    
    for (const org of response.data.organisations) {
      const children = [];
      for (const user of response.data.users)
      {
        if (org.id === user.organisation) {
          children.push({
            key: user.id,
            data: {
              access: user.access,
              created: FormatDate(user.created, true, true),
              disabled: user.disabled,
              email: user.email,
              lastlogin: FormatDate(user.lastLogin, true, true),
              organisation: user.organisation,
              updated: FormatDate(user.updated, true, true),
              name: user.username,
              type: 'user'
            }
          });
        }
      }

      const datarow = {
        children,
        data: { id: org.id, name: org.name, type: 'organisation' },
        key: org.id
      };
      datalist.value.push(datarow);
    }

    pageStatus.value = 1;
  } catch (error) {
    pageStatus.value = 2;
  }
}

/**
 * Send a request to resend the invitation email to a user
 * @param rowdata User data to resend the invitation for
 */
const resendInvitation = (rowdata: UserListUser): void => {
  dialogShow({
    group: 'dialogconfirm',
    header: t('general.resend_invitation'),
    message: t('dialog.resend_invitation', { email: rowdata.data.email, user: rowdata.data.name }),
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
      const apiUrl = `${AppSettings.env.API_URL}/users/resend-invitation/${rowdata.key}`;
      axios
        .post(apiUrl, {}, { headers: GetURLHeader() })
        .then(() => { toastShow(t('pages.settings.users.title'), t('toast.users_resend_ok'), 'success'); })
        .catch((error) => { toastShow(t('pages.settings.users.title'), t('toast.users_resend_fail'), 'error'); });
    },
    reject: () => {}
  });

  
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

.edit-button {
  background-color: #faf6f6; /* Blue */
  color: black;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
}
.edit-button:hover {
  background-color: rgb(199, 195, 195);
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
