<template>
  <div v-if="props.simple === true" class="header-simple">
    <div class="header-left">
    </div>
    <div class="header-right">
      <DarkMode />
      <Locale />
    </div>
  </div>
  <div v-else class="header">
    <div class="header-left">
      <Navigation />
    </div>
    <div class="header-right">
      <DarkMode />
      <Locale />
      <Logout />
      <User />
    </div>
  </div>
</template>
<script setup lang="ts">
import DarkMode from './header/DarkMode.vue';
import Locale from './header/Locale.vue';
import Logout from './header/Logout.vue';
import Navigation from './header/Navigation.vue';
import User from './header/User.vue';

const props = defineProps({
  simple: { // Simple header without user/navigation controls
    type: Boolean,
    default: false
  }
});
</script>
<style scoped>
.header {
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  background-color: var(--header-color);
  z-index: 2;
}

.header-left {
  display: flex;
  align-items: center;
  margin-left: 1em;
}

.header-left > div, .header-right > div {
  margin-right: 1em;
  pointer-events: all;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-simple {
  width: 100%;
  padding: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
  position: fixed;
  pointer-events: none;
}
</style>