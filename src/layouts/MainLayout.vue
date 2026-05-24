<template>
  <MsHeader />
  <div class="container">
    <MsSidebar />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import MsHeader from './ms-common/MsHeader.vue'
import MsSidebar from './ms-common/MsSidebar.vue'
</script>

<style scoped>
.container {
  width: 100%;
  height: calc(100% - 48px);
  display: flex;
}

.main-content {
  display: flex;
  flex-direction: column;
  width: calc(100% - 235px);
  height: 100%;
  padding: 12px 16px 16px;
}
</style>
