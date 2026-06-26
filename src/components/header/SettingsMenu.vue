<template>
  <div class="header-user pointer">
    <Button type="button" icon="pi pi-user" @click="toggle" />
  </div>
  <Popover ref="op">
    <div class="flex flex-col gap-4">
      <div>
        <span class="font-medium text-center block mb-2">{{ username }}</span>
        <ul class="list-none p-0 m-0 flex flex-col">
          <li class="gap-2 py-1 hover:bg-emphasis cursor-pointer rounded-border" @click="closePopover">
            <User :listItem="true" />
          </li>
          <li class="gap-2 py-1 hover:bg-emphasis cursor-pointer rounded-border" @click="closePopover">
            <DarkMode :listItem="true" />
          </li>
          <li class="gap-2 py-1 hover:bg-emphasis cursor-pointer rounded-border">
            <Locale :listItem="true" @locale-selected="closePopover" />
          </li>
          <li class="gap-2 py-1 hover:bg-emphasis cursor-pointer rounded-border" @click="closePopover">
            <Logout :listItem="true" />
          </li>
        </ul>
      </div>
    </div>
  </Popover>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from 'vue-router';
import Popover from 'primevue/popover';
import DarkMode from './DarkMode.vue';
import Locale from './Locale.vue';
import Logout from './Logout.vue';
import User from './User.vue';
import { StorageGet } from "../../services/Storage";

const router = useRouter();

const op = ref();
const username = StorageGet('username') || ''; // Get username from storage

/**
 * Close the popover after an action is taken (e.g., navigating to a different page)
 */
const closePopover = () => {
  op.value.hide();
}

/**
 * Toggle the popover
 * @param event Click event that triggered the toggle
 */
const toggle = (event: Event) => {
  op.value.toggle(event);
}

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
  padding: 6px;
}

Button {
  display: flex;
  justify-content: center;
  align-items: center;
  
  width: 1.5em;
  height: 1.5em;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ee08e 40%, #027d4a 100%);
}

.user-icon i { font-size: 1em; }
</style>