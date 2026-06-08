<template>
  <div class="forgot-password-container flex flex-col">
    <div class="page-top text-title text-center width-100">
      <span>{{ $t('app.name') }}</span>
    </div>
    <div class="page-bottom">
      <h1 class="margin-bottom">{{ $t('pages.forgot-password.title') }}</h1>
      <Form v-show="pageState === 0" v-slot="$form" :initialValues="{ username: '' }" @submit="handleForgotPassword" class="flex flex-col gap-4 w-full sm:w-56">
        <FormField v-slot="$field" name="username" initialValue="" class="flex flex-col gap-1">
          <IconField>
            <InputIcon class="pi pi-envelope"/>
            <InputText :maxlength="AppSettings.inputMax.email" name="username" type="email" :placeholder="$t('general.email')" fluid/>
          </IconField>
        </FormField>
        <Button type="submit">{{ $t('pages.forgot-password.send') }}</Button>
      </Form>
      <div v-show="pageState === 1" class="flex flex-col">
        <Loader text="pages.forgot-password.send_request" />
      </div>
      <div v-show="pageState === 2" class="flex flex-col">
        <span class="text-center margin-bottom">{{ $t('pages.forgot-password.success') }}</span>
        <Button @click="gotoLogin()">{{ $t('buttons.login') }}</Button>
      </div>
      <ErrorList :messages="errorMessages" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { Form, FormField } from '@primevue/forms';
import { Button, IconField, InputIcon, InputText } from 'primevue';
import { AppSettings } from '../services/Settings';
import ErrorList from '../components/ErrorList.vue';
import z from "zod";
import { StorageGet } from '../services/Storage';
import Loader from '../components/Loader.vue';
import { GetURLHeader } from '../services/Utils';

const router = useRouter();
const errorMessages = ref<string[]>([]);
const pageState = ref(0);

const formResolver = z.object({ // Form validation schema
  username: z
    .email('email_invalid')
    .min(1, 'email_none')
    .max(AppSettings.inputMax.email)
});

/**
 * Navigate to the login page
 */
const gotoLogin = () => {
  router.push('/');
}

/**
 * Handle forgot password form submission
 * @param formData - The submitted form data
 */
const handleForgotPassword = async (formData: any): Promise<void> => {
  try {
    formResolver.parse(formData.values);
    errorMessages.value = [];
  } catch(error: any){
    if (error instanceof z.ZodError) {
      const errors = [];
      for (const e of error.issues) { errors.push('validation.' + e.message); }
      errorMessages.value = errors;
    }
    return;
  }
  const lang = StorageGet('language');
  pageState.value = 1;
  await axios.post(AppSettings.env.API_URL + '/user/forgot-password', 
    { Email: formData.states.username.value, Language: lang },
    { headers: GetURLHeader(), }
  ).then((resp) => {
    pageState.value = 2;
  }).catch((err) => {
    errorMessages.value = ['errors.general.error'];
    pageState.value = 0;
  });
};
</script>

<style scoped>
.forgot-password-container {
  height: 100%;
  width: 100%;
}

.page-bottom {
  width: 20%;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 5;
  margin: 0 auto;
}

.page-top {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
