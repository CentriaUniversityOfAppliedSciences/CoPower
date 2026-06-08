<template>
  <div class="header-user pointer" @click="openUser()">
    <div class="user-icon">
      <i class="pi pi-user" />
    </div>
    <span v-if="username" class="username">{{ username }}</span>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { StorageGet } from '../../services/Storage';

const router = useRouter();
const username = StorageGet('username') || ''; // Get username from storage

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

.username {
  margin-left: auto;
  font-weight: bold;
  opacity: 1;
  display: flex;
  align-items: center;
  color: #fff;
  font-size: 1.25rem;
  text-transform: capitalize;
}
.user-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  
  width: 1.5em;
  height: 1.5em;
  margin-right: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ee08e 40%, #027d4a 100%);
}

.user-icon i { font-size: 1em; }
</style>