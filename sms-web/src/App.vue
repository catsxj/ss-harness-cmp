<template>
  <div id="app" @click="setTime">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const router = useRouter()
const route = useRoute()

appStore.getPageConfigs()

onMounted(() => {
  // 偶发后退无效问题 hack
  window.addEventListener(
    'hashchange',
    () => {
      const currentPath = window.location.hash.slice(1)
      if (route.path !== currentPath) router.push(currentPath)
    },
    false
  )
  setTimeout(() => {
    const el = document.getElementsByClassName('loading')[0]
    el?.parentElement?.removeChild(el)
  }, 2000)
})

function setTime() {
  appStore.setOperateTime()
}
</script>

<style lang="scss">
@import './common/css/index.scss';
</style>
