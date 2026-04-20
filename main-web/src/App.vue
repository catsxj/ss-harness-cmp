<template>
  <config-provider :locale="zhCN">
    <router-view v-if="showMainApp"></router-view>
    <Home v-else-if="getToken()"></Home>
  </config-provider>
</template>

<script setup lang="ts">
import { ConfigProvider } from 'ant-design-vue'
import { onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { getToken } from 'utils/auth'
import Home from './layouts/home.vue'

const store = useStore()
store.dispatch('GetPageConfigs')
const route = useRoute()
const router = useRouter()
onMounted(() => {
  // 偶发后退无效问题 hack
  window.addEventListener(
    'hashchange',
    () => {
      const currentPath = window.location.hash.slice(1)
      if (route.path !== currentPath) {
        router.push(currentPath)
      }
    },
    false
  )
  // 移除loading
  setTimeout(() => {
    const el = document.getElementsByClassName('loading')[0]
    ;(el?.parentElement as HTMLElement)?.removeChild(el)
  }, 1000 * 2)
})
const showMainApp = computed(() => {
  return ['/login', '/sso', '/lockme', '/redirect', '/404', '/license'].includes(route.path)
})
</script>
<style lang="scss">
@import './css/index.scss';
</style>
