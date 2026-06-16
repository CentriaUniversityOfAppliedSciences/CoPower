<template>
  <div class="flex-center">
    <i class="header-icon pi pi-language pointer" @click="toggleLanguage"></i>

    <Popover ref="languagepo">
      <div class="locale-list flex flex-col">
        <div v-for="lang in AppSettings.languages" :key="lang" class="locale-flag pointer flex flex-justify-end flex-align-center cursor-pointer" :class="{ 'locale-selected': languageCurrent() === lang }" @click="setLanguage(lang)">
          <i v-if="languageCurrent() === lang" class="pi pi-check locale-checkmark"></i>
          <img class="locale-flag-img" :src="`/dashboard/app/assets/locale/${lang}.svg`" :alt="t(`locale.${lang}`)" width="48px"/>
        </div>
      </div>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Popover } from 'primevue';
import { AppSettings } from "../../services/Settings";
import { languageChange, languageCurrent } from "../../services/i18n";
import { usePrimeVue } from "primevue/config";
import { useI18n } from "vue-i18n";
import { all as locales } from 'primelocale';

const { t } = useI18n();

const primevue = usePrimeVue();
const languagepo = ref(); // Reference to Popover component

onMounted(() => {
  setPrimeLocale(languageCurrent());
});

/**
 * Set the application language
 * @param lang - The language code to set
 */
const setLanguage = (lang: string): void => {
  if (languageCurrent() !== lang) {
    setPrimeLocale(lang);
    languageChange(lang);
  }
  languagepo.value.hide();
}

const setPrimeLocale = (lang: string): void => {
  const newLocale = locales[lang as keyof typeof locales];
  Object.assign(primevue.config.locale!, newLocale);
}

/**
 * Toggle the language popover
 * @param event - The click event
 */
const toggleLanguage = (event: any): void => {

  languagepo.value.toggle(event);
}
</script>
<style scoped>
.locale-checkmark {
  color: var(--color-green);
  font-size: 1.5em;
  margin-right: 0.5em;
}

.locale-flag { padding: 0.5em; }
.locale-flag-img { border: 1px solid var(--color-black); }
.locale-selected { background-color: var(--color-greenlight-opacity); }
</style>