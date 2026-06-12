<template>
  <MsHeader />
  <div class="container" :class="{ 'is-sidebar-collapsed': isSidebarCollapsed }">
    <MsSidebar v-model:collapsed="isSidebarCollapsed" />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import MsHeader from './ms-common/MsHeader.vue'
import MsSidebar from './ms-common/MsSidebar.vue'

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'ms-sidebar-collapsed'

function getInitialSidebarCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

const isSidebarCollapsed = ref(getInitialSidebarCollapsed())

watch(isSidebarCollapsed, (value) => {
  try {
    localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(value))
  } catch {
    // Ignore storage errors; layout still works for the current session.
  }
})
</script>

<style scoped>
.container {
  --ms-sidebar-width: 235px;
  width: 100%;
  min-width: 0;
  height: calc(100vh - 48px);
  display: flex;
  overflow: hidden;
  box-sizing: border-box;
}

.container.is-sidebar-collapsed {
  --ms-sidebar-width: 60px;
}

.main-content {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  width: auto;
  min-width: 0;
  height: 100%;
  padding: 12px 16px 16px;
  overflow: hidden;
  box-sizing: border-box;
  transition: width 0.2s ease;
}

</style>
