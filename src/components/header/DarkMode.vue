<template>
  <div class="flex-center" @click="toggleDarkMode()" :aria-label="darkmode === true ? $t('header-buttons.lightmode-accessible') : $t('header-buttons.darkmode-accessible')">
    <div class="flex-1 li-icon">
      <i class="pi pointer" :class="{ 'pi-moon': darkmode === true, 'pi-sun': darkmode === false }"></i>
    </div>
    <div v-if="listItem === true" class="flex-4 li-text">
      {{ darkmode === true ? $t('header-buttons.lightmode') : $t('header-buttons.darkmode') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { StorageSet } from '../../services/Storage';

const props = defineProps({
  listItem: { // If true, the component is used as a list item in the settings menu
    type: Boolean,
    default: false
  }
});

const darkmode = ref(document.documentElement.classList.contains('app-dark-mode')); // Initial state

/**
 * Toggle Dark Mode On/Off
 */
const toggleDarkMode = (): void => {
  if (darkmode.value === true) {
    document.documentElement.classList.remove('app-dark-mode');
  } else {
    document.documentElement.classList.add('app-dark-mode');
  }
  darkmode.value = !darkmode.value;
  StorageSet('darkmode', darkmode.value);
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
</style>