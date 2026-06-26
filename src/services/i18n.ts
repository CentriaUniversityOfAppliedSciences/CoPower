import { createI18n } from 'vue-i18n'
import { AppSettings } from './Settings';
import { toastShow } from './Toast';

import en from '../locale/en.json';
import fi from '../locale/fi.json';
import { StorageSet } from './Storage';

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: 'en', // Default locale
  fallbackLocale: 'en',
  messages: { en, fi }
});

/**
 * Change the application language
 * @param lang - The language code to change to
 */
function languageChange(lang: string): void {
  if (AppSettings.languages.includes(lang) === false) {
    toastShow('Change language', 'Unable to change to unsupported language', 'error');
    return;
  }
  
  i18n.global.locale.value = lang as 'en' | 'fi';
  document.documentElement.setAttribute('lang', lang);
  StorageSet('language', lang);
}

/**
 * Get the current application language
 * @returns The current language code
 */
function languageCurrent(): string {
  return i18n.global.locale.value;
}

export { i18n, languageChange, languageCurrent }