<template>
  <div class="forgot-password-container flex flex-col">
    <div class="forgot-password-wrapper">
      <div class="page-top text-title text-center width-100">
        <img src="/assets/img/logo.webp" alt="Centria CoPower" class="app-logo" />
      </div>
      <div class="page-bottom">
        <div v-show="pageState === 0" class="forgot-password-content">
          <h1 class="margin-bottom text-center">{{ $t('pages.reset-password.title.' + resetType) }}</h1>
          <Form v-slot="$form" :initialValues="{ username: '', password: '', passwordr: '' }" @submit="handleReset" class="flex flex-col gap-4 w-full sm:w-56">
            <div class="flex flex-col gap-1">
              <FormField class="flex flex-col gap-1">
                <IconField>
                  <InputIcon class="pi pi-envelope"/>
                  <InputText :disabled="true" v-model="email" :maxlength="AppSettings.inputMax.email" type="email" :placeholder="$t('general.email')" fluid/>
                </IconField>
              </FormField>
              <FormField v-slot="$field" name="password" initialValue="" class="flex flex-col gap-1 margin-top">
                <IconField>
                  <InputIcon class="pi pi-lock"/>
                  <Password :maxlength="AppSettings.inputMax.password" name="password" :feedback="false" :placeholder="$t('general.newpassword')" toggleMask fluid />
                </IconField>
              </FormField>
              <FormField v-slot="$field" name="passwordr" initialValue="" class="flex flex-col gap-1 margin-top">
                <IconField>
                  <InputIcon class="pi pi-lock"/>
                  <Password :maxlength="AppSettings.inputMax.password" name="passwordr" :feedback="false" :placeholder="$t('general.newpasswordr')" toggleMask fluid/>
                </IconField>
              </FormField>
              <span class="text-center">{{ $t('general.passwordrequirement') }}</span>
            </div>
            <ErrorList :messages="errorMessages" />
            <div v-show="resetActive" class="flex-center">
              <i class="pi pi-spin pi-spinner loader" />
            </div>
            <Button class="full-width margin-top" :disabled="resetActive" type="submit" severity="secondary" :label="resetType === 'password' ? $t('buttons.resetpw') : $t('buttons.register')"/>
          </Form>
        </div>
        <div v-show="pageState === 1" class="forgot-password-content text-center">
          {{ $t(errorMessage) }}
        </div>
        <div v-show="pageState === 2" class="flex-col flex-center">
          <span class="text-center margin-bottom">{{ $t('pages.reset-password.success_' + resetType) }}</span>
          <Button @click="gotoLogin()">{{ $t('buttons.login') }}</Button>
        </div>
        <div v-show="pageState >= 3">
          <Loader :text="loaderTexts[pageState - 3]" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { Form, FormField } from '@primevue/forms';
import { IconField, InputIcon, InputText, Password } from 'primevue';
import ErrorList from '../components/ErrorList.vue';
import Loader from '../components/Loader.vue';
import { AppSettings } from '../services/Settings';
import { GetURLHeader } from '../services/Utils';
import z from 'zod';

const validationSchemas = z.object({ // Form validation schema
  password: z
    .string()
    .min(10, 'password_too_short')
    .max(40, 'password_max')
    .refine((val) => /[a-z]/.test(val), 'password_lowercase')
    .refine((val) => /[A-Z]/.test(val), 'password_uppercase')
    .refine((val) => /[^A-Za-z0-9]/.test(val), 'password_special_char'),
  passwordr: z
    .string()
    .min(10, 'password_too_short')
    .max(40, 'password_max')
    .refine((val) => /[a-z]/.test(val), 'password_lowercase')
    .refine((val) => /[A-Z]/.test(val), 'password_uppercase')
    .refine((val) => /[^A-Za-z0-9]/.test(val), 'password_special_char')
});

const route = useRoute();
const router = useRouter();

const email = ref(''); // User email
const errorMessage = ref(''); // Error message key
const errorMessages = ref<string[]>([]); // Error messages array
const loaderTexts = ['pages.reset-password.check_token', 'pages.reset-password.resetting_password']; // Loader texts for different states
const resetActive = ref(false); // Reset button active state
const resetType = ref(''); // Type of reset, either 'password' or 'register'

/*
  Page states:
  0 = Reset password form
  1 = Expired or invalid token
  2 = Password reset complete
  3 = Checking token loading
  4 = Resetting password loading
*/
const pageState = ref(3);

onMounted(() => {
  validateToken();
  resetType.value = route.name === 'register' ? 'register' : 'password';
});

/**
 * Check the form validation
 * @param formData The form data to validate
 * @return Array of validation error messages
 */
const checkValidation = (formData: any): string[] => {
  const result: string[] = [];

  try {
    validationSchemas.parse(formData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      for (const e of error.issues) { result.push('validation.' + e.message); }
    }
  }

  if (formData.password !== formData.passwordr) {
    result.push('validation.password_new_mismatch');
  }
  
  return result;
};

/**
 * Navigate to the login page
 */
const gotoLogin = (): void => {
  router.push('/');
}

/**
 * Handle the password reset
 * @param formData The form data to submit
 */
const handleReset = async (formData: any): Promise<void> => {
  const valcheck = checkValidation(formData.values);
  if (valcheck.length > 0) {
    errorMessages.value = valcheck;
    return;
  } else { errorMessages.value = []; }

  pageState.value = 3;
  await axios.post(
    AppSettings.env.API_URL + '/user/reset-password', {
      token: route.params.token, // Pass the token from the URL
      newPassword: formData.values.password,
    }, {
      headers: GetURLHeader(),
    }).then((resp) => {
      pageState.value = 2;
    }).catch((err) => {
      errorMessages.value = ['pages.reset-password.fail_' + resetType.value];
      pageState.value = 0;
    });
}

/**
 * Validate the reset token
 */
const validateToken = async (): Promise<void> => {
  pageState.value = 3;
  // Validate the token with backend
  await axios.get(
    AppSettings.env.API_URL + `/user/validate-reset-token/${route.params.token}`, {
      headers: GetURLHeader(false)
    }).then((resp) => {
      if (resp.data !== 'error') {
        email.value = resp.data;
        pageState.value = 0;
      } else {
        errorMessage.value = 'pages.reset-password.validation_error.invalid_' + resetType.value;
        pageState.value = 1;
      }
    }).catch((err) => {
      if ((err.response !== undefined) && (err.response.status === 400) && (err.response.data === 'VRT847339')) {
        errorMessage.value = 'pages.reset-password.validation_error.invalid_' + resetType.value;
      } else { errorMessage.value = 'pages.reset-password.validation_error.error_' + resetType.value; }
      
      pageState.value = 1;
    });
}
</script>

<style scoped>
.forgot-password-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.forgot-password-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 20em;
  width: 25%;
  height: 100%;
}

.page-bottom {
  flex: 5;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.page-top {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
