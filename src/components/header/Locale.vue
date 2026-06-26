<template>
  <div class="flex-center" @click="toggleLanguage" :aria-label="$t('header-buttons.language-accessible')">
    <div class="flex-1 li-icon">
      <i class="header-icon pi pi-language pointer"></i>
    </div>
    <div v-if="listItem === true" class="flex-4 li-text">
      {{ $t('header-buttons.language') }}
    </div>

    <Popover ref="languagepo">
      <div class="locale-list flex flex-col">
        <div v-for="lang in AppSettings.languages" :key="lang" class="locale-flag pointer flex flex-justify-end flex-align-center cursor-pointer" :class="{ 'locale-selected': languageCurrent() === lang }" @click="setLanguage(lang)" :aria-label="t(`locale.${lang}`)">
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

const props = defineProps({
  listItem: { // If true, the component is used as a list item in the settings menu
    type: Boolean,
    default: false
  }
});

const primevue = usePrimeVue();
const languagepo = ref(); // Reference to Popover component

const emit = defineEmits<{ (e: 'localeSelected'): void }>();

onMounted(() => {
  setPrimeLocale(languageCurrent()); // Set PrimeVue locale on component mount
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
  emit('localeSelected');
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
.li-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  
  width: 1.5em;
  height: 1.5em;
  margin-right: 10px;
}

.li-text {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
}

.locale-checkmark {
  color: var(--color-green);
  font-size: 1.5em;
  margin-right: 0.5em;
}

.locale-flag { padding: 0.5em; }
.locale-flag-img { border: 1px solid var(--color-black); }
.locale-selected { background-color: var(--color-greenlight-opacity); }
</style>