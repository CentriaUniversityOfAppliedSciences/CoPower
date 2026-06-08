<template>
  <div class="header-logout flex-center">
    <div href="#" class="pi pi-sign-out pointer" id="Logout" @click="showLogout()"></div>
  </div>
</template>

<script setup lang="ts">
import { StorageRemove } from '../../services/Storage';
import { useRouter } from 'vue-router';
import { toastShow } from '../../services/Toast';
import { dialogShow } from '../../services/Dialog';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

/**
 * Handle user logout
 */
const handleLogout = (): void => {
  StorageRemove('jwtToken');
  StorageRemove('role');
  StorageRemove('username');
  toastShow(t('toast.logout'), t('toast.logout_ok'), 'success');
  router.push('/');
};

/**
 * Show logout confirmation dialog
 */
const showLogout = (): void => {
  dialogShow({
    group: 'dialogconfirm',
    header: t('dialog.logout'),
    message: t('dialog.logout_message'),
    rejectProps: {
      label: t('buttons.cancel'),
      icon: 'pi pi-times',
      outlined: true,
      size: 'small'
    },
    acceptProps: {
      label: t('buttons.confirm'),
      icon: 'pi pi-check',
      size: 'small'
    },
    accept: () => {
      handleLogout();
    },
    reject: () => {}
  });
};
</script>
<style scoped>
.header-logout {
  display: flex;
  align-items: center;
}
</style>