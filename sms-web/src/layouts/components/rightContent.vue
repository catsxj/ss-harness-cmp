<template>
  <div class="right-container">
    <LockScreen />
    <Process />
    <SiteMessage />
    <Personal />
  </div>
</template>

<script setup lang="ts">
import Personal from './personal/index.vue'
import Process from './process.vue'
import SiteMessage from './SiteMessage.vue'
import LockScreen from './lockScreen.vue'
</script>

<style lang="scss">
.right-container {
  display: flex;
}
</style>
