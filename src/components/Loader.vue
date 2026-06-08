<template>
  <div :class="['flex flex-col flex-center', { 'full-screen-absolute': absolute }]">
    <div class="margin-bottom">
      <ProgressSpinner :aria-label="$t(text)" />
    </div>
    <span v-if="text.length > 0">{{ $t(text) }}</span>
  </div>
</template>

<script setup lang="ts">
import { ProgressSpinner } from 'primevue';

defineProps({
  absolute: { // Full screen absolute positioning
    type: Boolean,
    required: false,
    default: false
  },
  text: { // Loading text key
    type: String,
    required: false,
    default: 'general.dataload'
  }
});

</script>

<style scoped>
.loader { font-size: 2em !important; }
</style>