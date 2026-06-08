<template>
  <div>
    <div class="text-xl font-bold">{{ $t('pages.settings.organisation.title') }}</div>
    <div class="profile-content flex-center">
      <Form class="profile-form" :initialValues="orgData" @submit="editOrganisation">
        <FormField v-slot="$field" name="name" class="flex flex-col gap-1 w-full margin-bottom">
          <IftaLabel>
            <InputText id="orgname" v-model="orgData.name" :maxlength="AppSettings.inputMax.name" />
            <label for="orgname">{{ $t('general.name') }}</label>
          </IftaLabel>
        </FormField>
        <div class="flex flex-center gap-2">
          <Button :label="$t('buttons.save')" :disabled="orgData.name === orgDataOriginal" type="submit"></Button>
        </div>
      </Form>
    </div>
    <ErrorList :messages="errorMessages" />
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { AppSettings } from '../services/Settings';
import { useI18n } from 'vue-i18n';
import z from 'zod';
import { FormatDate, GetURLHeader } from '../services/Utils';
import { toastShow } from '../services/Toast';
import ErrorList from '../components/ErrorList.vue';

import { Form, FormField } from '@primevue/forms';
import { IftaLabel, InputText } from 'primevue';

const { t } = useI18n();

const errorMessages = ref<string[]>([]); // Error messages array

const orgData = ref({ name: '' }); // Organisation data state
var orgDataOriginal = ''; // Original organisation data for comparison

const formResolver = z.object({ // Form validation schema
  name: z
    .string()
    .min(1, 'organisation_too_short')
    .max(AppSettings.inputMax.organisation, 'name_too_long')
});

onMounted(() => {
  getOrganisationData();
});

/**
 * Edit an organisation
 */
const editOrganisation = (formData: any): void => {
  if (orgData.value.name === orgDataOriginal) {
    toastShow(t('pages.settings.organisation.title'), t('toast.no_changes'), 'info');
    return;
  }

  try {
    formResolver.parse(formData.values);
  } catch(error) {
    if (error instanceof z.ZodError) {
      errorMessages.value = error.issues.map(issue => t('validation.' + issue.message));
    }
    return;
  }

  const apiUrl = `${AppSettings.env.API_URL}/organisation/update`;

  axios
    .post(apiUrl, {
      name: orgData.value.name
    }, {
      headers: GetURLHeader()
    }).then((response) => {
      orgDataOriginal = orgData.value.name;
      toastShow(t('pages.settings.organisations.title'), t('toast.organisation_edit_ok'), 'success');
    })
    .catch((error) => { toastShow(t('pages.settings.organisations.title'), t('toast.organisation_edit_fail'), 'error'); });
}

/**
 * Fetch the list of organisations from the API
 */
const getOrganisationData = (): void => {
  const apiUrl = `${AppSettings.env.API_URL}/organisation/init`;
  axios
    .get(apiUrl, {
      headers: GetURLHeader()
    })
    .then((response) => {
      try {
        orgData.value.name = response.data[0].name;
        orgDataOriginal = response.data[0].name;
      } catch (error) {
        orgData.value.name = '';
        orgDataOriginal = '';
      }
    })
    .catch((error) => {});
}
</script>

<style scoped>
form { width: 50%; }

.profile-content { margin-top: 2em; }
</style>
