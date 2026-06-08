<template>
  <div class="profile-wrapper">
    <Dialog ref="addNewOrganisationDialog" v-model:visible="deleteProfileDialog" modal :header="$t('buttons.deleteprofile')" :style="{ width: '25rem' }">
      <Form v-slot="$form" :initialValues="{ disabled: false, password: '' }" @submit="deleteProfile" class="flex flex-col gap-4 w-full">
        <div class="flex items-center gap-4 mb-4">
          <FormField v-slot="$field" name="password" initialValue="" class="flex flex-col gap-1 width-100">
            <label for="name" class="font-semibold w-24">{{ t('general.password') }}</label>
            <Password id="name" name="password" class="flex-auto" autocomplete="off" :feedback="false" :maxlength="AppSettings.inputMax.password" toggleMask fluid />
          </FormField>
        </div>
        <div class="flex items-center gap-4 mb-8">
          <FormField v-slot="$field" name="confirmation" :initialValue="false" class="flex gap-1 width-100">
            <div class="flex items-center gap-2 width-100">
              <Checkbox inputId="confirmation" value="confirmation" />
              <label for="confirmation" class="pointer">{{ t('pages.profile.delete_confirmation') }}</label>
            </div>
          </FormField>
        </div>
        <div class="flex">
          <ErrorList :messages="deletionErrorMessages" />
        </div>
        <div class="flex justify-end gap-2">
          <Button type="button" :label="$t('buttons.cancel')" severity="secondary" @click="deleteProfileDialog = false"></Button>
          <Button :label="$t('buttons.delete')" type="submit"></Button>
        </div>
      </Form>
    </Dialog>

    <div class="profile-content">
      <Form class="profile-form" v-slot="$form" v-show="dataprocess.error === false && dataprocess.load === false" @submit="confirmUpdate">
        <div class="margin-bottom">
          <h1>{{ $t('pages.profile.title') }}</h1>
        </div>
        <FormField v-slot="$field" name="name" initialValue="" class="flex flex-col gap-1 w-full margin-bottom">
          <IftaLabel>
            <InputText id="name" v-model="userdata.name" :maxlength="AppSettings.inputMax.name" />
            <label for="name">{{ $t('general.name') }}</label>
          </IftaLabel>
        </FormField>
        <FormField v-slot="$field" name="email" initialValue="" class="flex flex-col gap-1 w-full margin-bottom">
          <IftaLabel>
            <InputText id="email" v-model="userdata.email" :maxlength="AppSettings.inputMax.email" />
            <label for="email">{{ $t('general.email') }}</label>
          </IftaLabel>
        </FormField>
        <FormField v-slot="$field" name="passwordc" initialValue="" class="flex flex-col gap-1 w-full margin-bottom">
          <IftaLabel>
            <Password id="passwordc" v-model="userdata.passwordc" :feedback="false" :maxlength="AppSettings.inputMax.password" toggleMask fluid />
            <label for="passwordc">{{ $t('pages.profile.passwordc') }}</label>
          </IftaLabel>
        </FormField>
        
        <div class="flex flex-center gap-2 margin-bottom">
          <Checkbox id="changepw" v-model="userdata.changepw" initialValue="" inputId="changepw" name="changepw" value="newpassword" />
          <label for="changepw" class="pointer">{{ $t('pages.profile.changepw') }}</label>
        </div>

        <div v-show="userdata.changepw.length > 0">
          <span>{{ $t('general.passwordrequirement') }}</span>

          <FormField v-slot="$field" name="passwordn" initialValue="" class="flex flex-col gap-1 w-full margin-bottom margin-top">
            <IftaLabel class="width-100">
              <Password id="passwordn" v-model="userdata.passwordn" :feedback="false" :maxlength="AppSettings.inputMax.password" toggleMask fluid />
              <label for="passwordn">{{ $t('general.newpassword') }}</label>
            </IftaLabel>
          </FormField>
          <FormField v-slot="$field" name="passwordr" initialValue="" class="flex flex-col gap-1 w-full margin-bottom">
            <IftaLabel class="width-100">
              <Password id="passwordr" v-model="userdata.passwordr" :feedback="false" :maxlength="AppSettings.inputMax.password" toggleMask fluid />
              <label for="passwordr">{{ $t('general.newpasswordr') }}</label>
            </IftaLabel>
          </FormField>
        </div>

        <Button class="margin-bottom" :label="$t('buttons.deleteprofile')" type="button" @click="deleteProfileDialog = true" />
        <Button :label="$t('buttons.save')" type="submit" />
      </Form>
  
      <Error v-if="dataprocess.error === true"  @reload="fetchUser()" />
      <Loader v-if="dataprocess.load === true" text="general.dataload" />
      <ErrorList :messages="errorMessages" />
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { Checkbox, Dialog, IftaLabel, InputText, Password } from 'primevue';
import { Form, FormField } from '@primevue/forms';
import { AppSettings } from '../services/Settings';
import { GetURLHeader } from '../services/Utils';
import Loader from '../components/Loader.vue';
import Error from '../components/ErrorRetry.vue';
import z from 'zod';
import ErrorList from '../components/ErrorList.vue';
import { toastShow } from '../services/Toast';
import { useI18n } from 'vue-i18n';
import App from '../App.vue';

interface Userdata { // User data structure
  changepw: string[];
  email: string;
  name: string;
  passwordc: string;
  passwordn: string;
  passwordr: string;
  pvalid: boolean;
  prvalid: boolean;
}

const { t } = useI18n();

const deleteProfileDialog = ref(false); // Delete profile dialog visibility

const validationSchemas = { // Validation schemas using zod
  password: z.object({
    password: z
      .string()
      .min(AppSettings.inputMax.password_min, 'password_too_short')
      .max(AppSettings.inputMax.password, 'password_max')
      .refine((val) => /[a-z]/.test(val), 'password_lowercase')
      .refine((val) => /[A-Z]/.test(val), 'password_uppercase')
      .refine((val) => /[^A-Za-z0-9]/.test(val), 'password_special_char')
  }),
  passwordn: z.object({
    passwordn: z
      .string()
      .min(AppSettings.inputMax.password_min, 'password_new_too_short')
      .max(AppSettings.inputMax.password, 'password_new_max')
      .refine((val) => /[a-z]/.test(val), 'password_new_lowercase')
      .refine((val) => /[A-Z]/.test(val), 'password_new_uppercase')
      .refine((val) => /[^A-Za-z0-9]/.test(val), 'password_new_special_char')
  }),
  profile: z.object({
    email: z
      .email('email_invalid')
      .max(AppSettings.inputMax.email),
    name: z
      .string()
      .min(1, 'name_too_short')
      .max(AppSettings.inputMax.name),
    passwordc: z
      .string()
      .min(10, 'password_too_short')
      .max(40, 'password_max')
      .refine((val) => /[a-z]/.test(val), 'password_lowercase')
      .refine((val) => /[A-Z]/.test(val), 'password_uppercase')
      .refine((val) => /[^A-Za-z0-9]/.test(val), 'password_special_char')
  })
};

onMounted(() => {
  fetchUser();
});

const dataprocess = ref({ error: false, load: false }); // Data process state
const deletionErrorMessages = ref<string[]>([]); // Deletion error messages
const errorMessages = ref<string[]>([]); // General error messages
const originalUserdata: Userdata = { changepw: [], email: '', name: '', passwordc: '', passwordn: '', passwordr: '', pvalid: false, prvalid: false }; // Original user data for comparison
const userdata = ref<Userdata>({ changepw: [], email: '', name: '', passwordc: '', passwordn: '', passwordr: '', pvalid: false, prvalid: false }); // Reactive user data

/**
 * Check form validation
 * @param formData Form data to validate
 * @return Array of error message keys
 */
const checkValidation = (formData: any): string[] => {
  const result: string[] = [];

  if ((userdata.value.email === originalUserdata.email) && (userdata.value.name === originalUserdata.name)) {
    result.push('validation.nochanges');
  } else {
    try {
      validationSchemas.profile.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        for (const e of error.issues) { result.push('validation.' + e.message); }
      }
    }

    if (userdata.value.changepw.includes('newpassword') === true) {
      try {
        validationSchemas.passwordn.parse(formData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          for (const e of error.issues) { result.push('validation.' + e.message); }
        }
      }

      if (userdata.value.passwordn !== userdata.value.passwordr) { result.push('validation.password_new_mismatch'); }
    }
  }
  
  return result;
};

/**
 * Confirm profile update
 * @param formData Form data to confirm
 */
const confirmUpdate = (formData: any): void => {
  formData.values.email = userdata.value.email;
  formData.values.name = userdata.value.name;
  formData.values.passwordc = userdata.value.passwordc;
  formData.values.passwordn = userdata.value.passwordn;
  formData.values.passwordr = userdata.value.passwordr;

  const valcheck = checkValidation(formData.values);
  if (valcheck.length > 0) {
    errorMessages.value = valcheck;
  } else {
    errorMessages.value = [];
    updateUser();
  }
};

/**
 * Delete user profile
 * @param formData Form data for deletion
 */
const deleteProfile = async (formData: any): Promise<void> => {
  const result: string[] = [];
  try {
    validationSchemas.password.parse(formData.values);
  } catch (error) {
    if (error instanceof z.ZodError) {
      for (const e of error.issues) { result.push('validation.' + e.message); }
    }
  }
  if (result.length > 0) {
    deletionErrorMessages.value = result;
    return;
  }

  if (formData.values.confirmation === false) {
    deletionErrorMessages.value = ['errors.profile.delete_confirmation'];
    return;
  }

  const response = await axios.post(`${AppSettings.env.API_URL}/user/delete`, { password: formData.values.password }, { headers: GetURLHeader() });
};

/**
 * Fetch user data from the API
 */
const fetchUser = async (): Promise<void> => {
  dataprocess.value.error = false;
  dataprocess.value.load = true;
  try {
    const response = await axios.get(`${AppSettings.env.API_URL}/user`, { headers: GetURLHeader() });
    userdata.value.email = response.data.email;
    userdata.value.name = response.data.name;
    originalUserdata.email = response.data.email;
    originalUserdata.name = response.data.name;
  } catch (error) {
    dataprocess.value.error = true;
  } finally {
    dataprocess.value.load = false;
  }
};

/**
 * Update user data via the API
 */
const updateUser = (): void => {
  axios
    .put(`${AppSettings.env.API_URL}/user`, {
      email: userdata.value.email,
      name: userdata.value.name,
      currentPassword: userdata.value.passwordc,
      newPassword: userdata.value.changepw.includes('newpassword') ? userdata.value.passwordn : '',
    }, {
      headers: GetURLHeader(),
    })
    .then((response) => {
      toastShow(t('toast.profile_update'), t('toast.profile_update_ok'), 'success');
      userdata.value.passwordc = '';
      userdata.value.passwordn = '';
      userdata.value.passwordr = '';
      userdata.value.changepw = [];
      originalUserdata.email = userdata.value.email;
      originalUserdata.name = userdata.value.name;
    })
    .catch((error) => {
      toastShow(t('toast.profile_update'), t('toast.profile_update_fail'), 'error');
    });
};
</script>

<style scoped>
button { width: 50%; }

.profile-content {
  margin: auto 0;

  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-form {
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-wrapper {
  width: 100%;
  height: 100%;

  display: flex;
  place-items: center;
  justify-content: center;
}
</style>
