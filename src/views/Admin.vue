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
    flex: 1;
    
  }

  .sidebar { width: 100%; }
}

@media (orientation: landscape) {
  .sidebar { width: 200px; }

  .content {
    flex: 1;
    padding: 5px;
  }
}
</style>
