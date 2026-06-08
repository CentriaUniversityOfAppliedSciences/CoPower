<template>
  <div class="flex flex-col error-messages margin-top">
    <span v-for="e of errorMessages.messages">{{ $t(e) }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  messages: { // Error message keys to display
    type: Array<string>,
    required: true,
    default: []
  }
});

// Watch for changes in the messages prop
watch(() => props.messages, (newVal, oldVal) => {
  displayErrors(newVal);
});

const errorMessages = ref<{ messages: string[]; timeout: ReturnType<typeof setTimeout> | null }>({ messages: [], timeout: null }); // Reactive error messages and timeout

/**
 * Display error messages
 * @param keys - Error message keys to display
 */
const displayErrors = (keys: string[]): void => {
  if (errorMessages.value.timeout !== null) {
    clearTimeout(errorMessages.value.timeout);
  }
  errorMessages.value.messages = keys;

  errorMessages.value.timeout = setTimeout(() => { errorMessages.value.messages = []; }, 6000);
};
</script>

<style scoped>
.error-messages { text-align: center; }
</style>