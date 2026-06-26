<template>
  <div class="admin-layout">
    <Sidebar class="sidebar" />
    <div class="content">
      <router-view></router-view>
      <!-- Renders selected admin section -->
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue';
</script>

<style scoped>
.admin-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

.content {
  overflow-y: auto;
}

@media (orientation: portrait) {
  .admin-layout {
    flex-direction: column;
  }

  .content {
    flex: 9;
  }

  .sidebar {
    flex: 1;
    width: 100%;
  }
}

@media (orientation: landscape) {
  .sidebar {
    flex: 1;
  }

  .content {
    flex: 9;
    padding: 5px;
  }
}
</style>
