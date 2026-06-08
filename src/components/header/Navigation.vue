<template>
  <div v-if="!hideNavigation" class="navigation">
    <router-link id="home" to="/home">
      <i class="home-button pi pi-home" />
    </router-link>
    <router-link id="Dashboard" to="/dashboard" v-if="CheckAccess('user')">{{ t('general.dashboard') }}</router-link>
    <router-link id="Admin" to="/admin" v-if="CheckAccess('admin')">{{ t('general.settings') }}</router-link>
    <router-link id="HMI" to="/hmi" v-if="CheckAccess('appadmin')">{{ t('general.hmi') }}</router-link>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { CheckAccess } from '../../services/Utils';

const { t } = useI18n();

const route = useRoute();

/**
 * Computed property to determine if the navigation bar should be hidden based on the current route.
 */
const hideNavigation = computed(
  () => route.path === '/forgot-password' || route.path === '/reset-password'
);
</script>
<style>
.home-button {
  font-size: 1.5em !important;
  margin-left: 0.5em;
}

.navigation {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.navigation a {
  display: inline-block;
  margin-right: 20px;
  color: white;
  opacity: 0.7;
  transition: 0.2 ease color;
}
.navigation a.router-link-active,
.navigation a:hover { opacity: 1; }
</style>
