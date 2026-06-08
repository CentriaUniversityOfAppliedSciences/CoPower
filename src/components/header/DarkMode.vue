<template>
  <div class="flex-center">
    <i class="pi pointer" :class="{ 'pi-moon': darkmode === true, 'pi-sun': darkmode === false }" @click="toggleDarkMode()"></i>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { StorageSet } from '../../services/Storage';

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

</style>