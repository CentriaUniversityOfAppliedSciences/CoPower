<template>
  <div class="login-container flex flex-col">
    <div class="page-top text-title text-center width-100">
      <img src="/assets/img/logo.webp" alt="Centria CoPower" class="app-logo" />
    </div>
    <div class="page-bottom">
      <div v-show="pageState === 0"> <!-- Login -->
        <Form v-slot="$form" :initialValues="{ username: '', password: '' }" @submit="handleLogin" class="flex flex-col gap-4 w-full sm:w-56">
          <div class="flex flex-col gap-1">
            <FormField v-slot="$field" name="username" initialValue="" class="flex flex-col gap-1">
              <IconField>
                <InputIcon class="pi pi-envelope"/>
                <InputText :maxlength="AppSettings.inputMax.email" name="username" type="email" :placeholder="$t('general.email')" fluid/>
              </IconField>
            </FormField>
            <FormField v-slot="$field" name="password" initialValue="" class="flex flex-col gap-1 margin-top">
              <IconField>
                <InputIcon class="pi pi-lock"/>
                <Password :feedback="false" :maxlength="AppSettings.inputMax.password" name="password" :placeholder="$t('general.password')" toggleMask fluid/>
              </IconField>
            </FormField>
          </div>
          <div class="text-right">
            <span class="pointer" @click="openForgotPassword()">{{ $t('pages.login.fpassword') }}</span>
          </div>
          <ErrorList :messages="errorMessages" />
          <div v-show="loginActive" class="flex-center">
            <i class="pi pi-spin pi-spinner loader" />
          </div>
          <Button class="full-width margin-top" :disabled="loginActive" type="submit" severity="secondary" :label="$t('buttons.login')"/>
        </Form>
        <span class="flex-center margin-top">{{ $t('pages.login.or') }}</span>
        <Button class="full-width margin-top" :disabled="loginActive" type="button" severity="secondary" :label="$t('pages.login.public')" @click="openPublic()"/>
      </div>
      <div v-show="pageState >= 1">
        <Loader :text="loaderTexts[pageState - 1]" />
      </div>
    </div>
  </div>
</template>
<style>

</style>
<script setup lang="ts">
import { useRouter } from 'vue-router';
import axios from 'axios';

import { Form } from '@primevue/forms';
import { FormField } from '@primevue/forms';
import { IconField, InputIcon, InputText, Password } from 'primevue';
import { StorageGet, StorageRemove, StorageSet } from '../services/Storage';
import { AppSettings } from '../services/Settings';
import ErrorList from '../components/ErrorList.vue';
import Loader from '../components/Loader.vue';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import z from 'zod';
import { toastShow } from '../services/Toast';
import { GetURLHeader, jwtDecode } from '../services/Utils';

const { t } = useI18n();
const router = useRouter();

const loaderTexts = ['general.checkLogin', 'pages.login.login']; // Loader texts for different states
const loginActive = ref(false); // Login button active state
/*
  Page states:
  0 = login form
  1 = check login load
  2 = login load
*/
const pageState = ref(0);

const errorMessages = ref<string[]>([]); // Error messages array
const formResolver = z.object({ // Form validation schema
  username: z
    .email('email_invalid')
    .min(1, 'email_none')
    .max(AppSettings.inputMax.email),
  password: z
    .string()
    .min(AppSettings.inputMax.password_min, 'password_too_short')
    .max(AppSettings.inputMax.password)
});

onMounted(() => {
  if (StorageGet('loginExpired') === true) { // Show login expired message if redirected from router due to expired token
    StorageRemove('loginExpired');
    toastShow(t('toast.login'), t('toast.check_login_expired'), 'error');
  } else { checkLogin(); }
});

/**
 * Navigate to the forgot password page
 */
const openForgotPassword = (): void => {
  router.push('/forgot-password');
}

/**
 * Check login form input validity
 * @param formData Form data to validate
 * @returns boolean indicating if input is valid
 */
const checkInput = (formData: any): boolean => {
  try {
    formResolver.parse(formData);
    return true;
  } catch(error){
    if (error instanceof z.ZodError) {
      const errors = [];
      for (const e of error.issues) { errors.push('validation.' + e.message); }
      errorMessages.value = errors;
    }
    return false;
  }
}

/**
 * Check if user is already logged in
 */
const checkLogin = (): void => {
  const token = StorageGet('jwtToken');
  if (token !== null) {
    pageState.value = 1;

    axios
      .get(`${AppSettings.env.API_URL}/user/check`, {
        headers: GetURLHeader()
      })
      .then((response) => {
        StorageSet('jwtToken', response.data.token);
        StorageSet('username', response.data.name);
        var claims = jwtDecode(response.data.token);
        if (claims !== null) {
          StorageSet('role', claims.role);
          StorageSet('userid', claims.name);
          loginActive.value = false;
          router.push('/home');
        } else {
          StorageRemove('jwtToken');
          toastShow(t('toast.check_login'), t('toast.check_login_expired'), 'error');
        }
      })
      .catch((error) => {
        if (error.code === 'ERR_NETWORK') {
          toastShow(t('toast.check_login'), t('toast.check_login_network_error'), 'error');
        } else { toastShow(t('toast.check_login'), t('toast.check_login_error'), 'error'); }
      })
      .finally(() => { pageState.value = 0; });
  }
}

/**
 * Handle login form submission
 * @param formData - The Form data
 */
const handleLogin = async (formData: any): Promise<void> => {
  if (import.meta.env.MODE === 'development') { formData.values = { username: import.meta.env.VITE_DEV_USER, password: import.meta.env.VITE_DEV_PASSWORD }; }
  //formData.values.password = import.meta.env.VITE_DEV_PASSWORD;
  if (checkInput(formData.values) === false) { return; }
  pageState.value = 2;
  
  axios.post(
    AppSettings.env.API_URL + '/user/authenticate',
    {
      email: formData.values.username,
      password: formData.values.password
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-CoPower-API': AppSettings.env.API_KEY,
      },
    }
  ).then((response) => {
    StorageSet('jwtToken', response.data.token);
    StorageSet('username', response.data.name);
    var claims = jwtDecode(response.data.token);
    if (claims !== null) {
      StorageSet('userid', claims.name);
      StorageSet('role', claims.role);
      toastShow(t('toast.login'), t('toast.login_ok'), 'success');
      loginActive.value = false;
      router.push('/home');
    } else {
      errorMessages.value = ['errors.general.error'];
    }
  }).catch((error) => {
    loginActive.value = false;
    if (error.response) {
      switch (error.response.data) {
        case 'AUT425051': case 'AUT767551': { errorMessages.value = ['errors.login.' + error.response.data]; break; }
        default: { errorMessages.value = ['errors.login.fail']; }
      }
    } else { errorMessages.value = ['errors.general.error']; }
  }).finally(() => {
    pageState.value = 0;
  });
}

/**
 * Navigate to the public page
 */
const openPublic = (): void => {
  router.push('/public');
}
</script>
<style scoped>
.login-container {
  min-width: 25em;
  max-width: 25em;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 2em;
}

.login-layout { height: 100%; }

.logo { margin-bottom: 1em; }

.page-bottom {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 5;
}

.page-top {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>