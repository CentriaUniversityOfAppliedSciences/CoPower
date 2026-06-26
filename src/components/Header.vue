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
    <div class="header-center">
      <img class="logo-image" src="/assets/img/logo.webp" alt="Application logo" />
    </div>
    <div class="header-right header-settings-minimal">
      <div>
        <SettingsMenu />
      </div>
    </div>
    <div class="header-right header-settings-full">
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
import SettingsMenu from './header/SettingsMenu.vue';
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
  height: 100%;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--header-color);
  z-index: 2;
}

.header-center {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0.75;
}

.header-left {
  height: 100%;
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.header-right > div {
  margin-right: 0.5em;
  pointer-events: all;
}

.header-right {
  height: 100%;
  flex: 1;
  align-items: center;
  justify-content: flex-end;
}

.header-settings-minimal {
  justify-content: flex-end;
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

.header-simple .header-right {
  display: flex;
}

.logo-image {
  max-width: 5em;
  height: auto;
}

/* Tablet */
@media (min-width: 768px) {
  .logo-image { max-width: 6.5em; }
}

/* Laptop / small desktop */
@media (min-width: 1024px) {
}

/* Large desktop */
@media (min-width: 1280px) {
  .logo-image { max-width: 6em; }
}

/* Extra large desktop */
@media (min-width: 1536px) {
  .logo-image { max-width: 8em; }
}
</style>