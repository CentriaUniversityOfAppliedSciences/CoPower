<template>
  <div v-if="listItem === true" class="flex-center" @click="openUser()" :aria-label="$t('header-buttons.user-accessible')">
    <div class="flex-1 li-icon">
      <i class="pi pointer pi-user" />
    </div>
    <div class="flex-4 li-text">
      {{ $t('header-buttons.user') }}
    </div>
  </div>
  <div v-else class="header-user pointer" @click="openUser()">
    <div class="user-icon">
      <i class="pi pi-user" />
    </div>
    <div class="flex-4 li-text">
      <span v-if="username" class="username">{{ username }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { StorageGet } from '../../services/Storage';

const router = useRouter();
const username = StorageGet('username') || ''; // Get username from storage

const props = defineProps({
  listItem: { // If true, the component is used as a list item in the settings menu
    type: Boolean,
    default: false
  }
});

/**
 * Open user profile page
 */
const openUser = (): void => {
  router.push('/profile');
};
</script>
<style scoped>
.header-user {
  display: flex;
  align-items: center;
  background: #035e36;
  border-radius: 20px;
  padding: 6px 18px 6px 10px;
}

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

.username {
  margin-left: auto;
  font-weight: bold;
  opacity: 1;
  display: flex;
  align-items: center;
  color: #fff;
  font-size: 1rem;
  text-transform: capitalize;
}
.user-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  
  min-width: 1.5em;
  min-height: 1.5em;
  margin-right: 0.5em;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ee08e 40%, #027d4a 100%);
}

.user-icon i { font-size: 1em; }
</style>