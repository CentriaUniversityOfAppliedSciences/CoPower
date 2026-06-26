<template>
  <div v-if="!hideNavigation" class="navigation">
    <div class="navigation-left">
      <router-link id="home" to="/home">
        <i class="home-button pi pi-home" />
      </router-link>
    </div>
    <div class="navigation-right-full">
      <router-link id="Dashboard" to="/dashboard" v-if="CheckAccess('user')">{{ t('navigation.dashboard') }}</router-link>
      <router-link id="Admin" to="/admin" v-if="CheckAccess('admin')">{{ t('navigation.settings') }}</router-link>
      <router-link id="HMI" to="/hmi" v-if="CheckAccess('appadmin')">{{ t('navigation.hmi') }}</router-link>
    </div>
    <div class="navigation-right-minimal">
      <Select v-if="CheckAccess('user', true)" v-model="selectedPage" :options="pagesUser" optionLabel="name" optionValue="code" :placeholder="$t('general.navigate')" class="w-full md:w-56" />
      <Select v-if="CheckAccess('admin', true)" v-model="selectedPage" :options="pagesAdmin" optionLabel="name" optionValue="code" :placeholder="$t('general.navigate')" class="navigation-select w-full md:w-56" @change="changePage"/>
      <Select v-if="CheckAccess('appadmin', true)" v-model="selectedPage" :options="pagesAppAdmin" optionLabel="name" optionValue="code" :placeholder="$t('general.navigate')" class="w-full md:w-56" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Select } from 'primevue';
import { CheckAccess } from '../../services/Utils';

const { t } = useI18n();

const { locale } = useI18n();
const route = useRoute();
const router = useRouter();

watch(locale, (newLang) => { // Watch for changes in the locale and update the navigation labels accordingly
  pagesAdmin.value = [
    { name: t('navigation.home'), code: '/home' },
    { name: t('navigation.dashboard'), code: '/dashboard' },
    { name: t('navigation.settings'), code: '/admin' },
    { name: t('navigation.hmi'), code: '/hmi' }
  ];
  pagesAppAdmin.value = [
    { name: t('navigation.home'), code: '/home' },
    { name: t('navigation.dashboard'), code: '/dashboard' },
    { name: t('navigation.settings'), code: '/admin' }
  ];
  pagesUser.value = [
    { name: t('navigation.home'), code: '/home' },
    { name: t('navigation.dashboard'), code: '/dashboard' }
  ];
})

const selectedPage = ref();
const pagesAppAdmin = ref([
  { name: t('navigation.home'), code: '/home' },
  { name: t('navigation.dashboard'), code: '/dashboard' },
  { name: t('navigation.settings'), code: '/admin' },
  { name: t('navigation.hmi'), code: '/hmi' }
]);
const pagesAdmin = ref([
  { name: t('navigation.home'), code: '/home' },
  { name: t('navigation.dashboard'), code: '/dashboard' },
  { name: t('navigation.settings'), code: '/admin' }
]);
const pagesUser = ref([
  { name: t('navigation.home'), code: '/home' },
  { name: t('navigation.dashboard'), code: '/dashboard' }
]);

onMounted(() => {
  setTimeout(() => { selectedPage.value = route.path; }, 0); // Set the selected page based on the current route after the component is mounted
});

/**
 * Computed property to determine if the navigation bar should be hidden based on the current route.
 */
const hideNavigation = computed(
  () => route.path === '/forgot-password' || route.path === '/reset-password'
);

const changePage = () => {
  switch (selectedPage.value) {
    case '/home': { router.push('/home'); break; }
    case '/dashboard': { router.push('/dashboard'); break; }
    case '/admin': { router.push('/admin'); break; }
    case '/hmi': { router.push('/hmi'); break; }
  }
};
</script>
<style>
.home-button {
  font-size: 1.5em !important;
  margin-left: 0.5em;
}

.navigation {
  width: 100%;
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

.navigation-left {
  flex: 1;
  align-items: center;
}

.navigation-right-full {
  flex: 9;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.navigation-right-minimal {
  flex: 6;
  align-items: center;
  justify-content: center;
}

.navigation-select {
  width: 90%;
  min-width: 90%;
  max-width: 90%;
}
</style>
