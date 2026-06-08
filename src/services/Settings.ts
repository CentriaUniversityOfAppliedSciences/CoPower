import { languageChange } from "./i18n";
import { StorageGet, StorageSet } from "./Storage";

/**
 * Initialize dark mode based on user preference or system settings
 */
function darkModeInit(): void {
  let darkmode = StorageGet('darkmode');
  if (darkmode === null) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    darkmode = prefersDark.matches;
    StorageSet('darkmode', darkmode);
  }
  document.documentElement.classList.toggle('app-dark-mode', darkmode)
}

/**
 * Initialize application language based on stored preference
 */
function languageInit(): void {
  let lang = StorageGet('language');
  if (lang === null) { lang = AppSettings.languages[0]; }
  languageChange(lang);
}

const AppSettings = { // Application settings
  dashboardUpdateInterval: 900, // Interval for updating the dashboard in seconds
  env: {
    API_KEY: import.meta.env.VITE_API_KEY, // API key for the application
    API_URL: import.meta.env.VITE_API_URL, // Base URL for the API
    DASHBOARD_UPDATE_INTERVAL: import.meta.env.VITE_DASHBOARD_UPDATE_INTERVAL // Dashboard update interval in seconds
  },
  HMIDataOutdatedLimit: 3600 * 3, // Time limit in seconds for considering HMI data outdated
  inputMax: {
    dashboardChartNameMax: 80, // Maximum length for dashboard chart name input
    deviceSource: 50, // Maximum length for device source input
    email: 60, // Maximum length for email input
    name: 40, // Maximum length for name input
    organisation: 60, // Maximum length for organisation input
    password: 40, // Maximum length for password input
    password_min: 10, // Minimum length for password input
    unit: 20, // Maximum length for unit input
    valueChange: 1000000 // Maximum length for value divider input
  },
  languages: ['en', 'fi'], // Supported application languages
  passwordRegex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{10,}$/ // Password complexity regex
};

export { AppSettings, darkModeInit, languageInit }