<template>
  <div :class="['flex flex-col flex-center pointer', { 'full-screen-absolute': absolute }]" @click="$emit('reload')">
    <div v-if="title.length > 0" class="sensor-title flex-center">
      {{ title }}
    </div>
    <div class="margin-bottom">
      <i class="error pi pi-sync" />
    </div>
    <span>{{ $t(props.message !== '' ? props.message : 'general.datageterror') }}</span>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ (e: 'reload'): void }>();

const props = defineProps({
  absolute: { // Full screen absolute positioning
    type: Boolean,
    required: false,
    default: false
  },
  message: { // Custom error message key
    type: String,
    required: false,
    default: ''
  },
  title: {
    type: String,
    required: false,
    default: ''
  }
});
</script>

<style scoped>
.error { font-size: 2em !important; }

.sensor-title {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4em;
}
</style>