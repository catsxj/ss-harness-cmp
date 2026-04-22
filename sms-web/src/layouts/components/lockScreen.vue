<template>
  <div class="m-r-md">
    <el-icon class="lock" @click="lockScreen"><Lock /></el-icon>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Lock } from '@element-plus/icons-vue'
import { replaceToken } from 'services/system'
import { setToken, getToken } from 'utils/auth'
import { useAppStore, usePermissionStore } from '@/stores'
import router, { resetRouter } from '@/router'

const route = useRoute()
const routerInstance = useRouter()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const timer = ref<number>(0)

const userData = computed(() => appStore.userData)
const operateTime = computed(() => appStore.operateTime)
const lockScreenTime = computed(
  () => (appStore.systemConfig as { lockScreenTime?: string | number }).lockScreenTime ?? 0
)

function clearTimer(): void {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = 0
  }
}

async function getLastToken(): Promise<void> {
  const token = getToken()
  const res = await replaceToken({ token })
  if (res.success) {
    setToken(res.data)
  } else {
    clearTimer()
    await permissionStore.resetRoutes(router, resetRouter)
  }
}

function lockScreen(): void {
  localStorage.setItem(
    'lockData',
    JSON.stringify({
      path: route.fullPath,
      isLock: true
    })
  )
  routerInstance.push({ name: 'LockMe' })
}

function init(): void {
  appStore.setOperateTime()
  const lockDataRaw = localStorage.getItem('lockData')
  if (lockDataRaw) {
    try {
      const lockData = JSON.parse(lockDataRaw) as { isLock?: boolean }
      if (lockData.isLock) routerInstance.push({ name: 'LockMe' })
    } catch {
      /* ignore */
    }
  }
}

init()

onMounted(() => {
  timer.value = window.setInterval(() => {
    getLastToken()
    const interval = 1000 * 60 * Number(lockScreenTime.value)
    if (interval && new Date().getTime() - Number(operateTime.value) >= interval) {
      lockScreen()
    }
  }, 1000 * 20)
})

onUnmounted(clearTimer)

defineExpose({ lockScreen, userData })
</script>

<style scoped>
.lock {
  font-size: 20px;
  cursor: pointer;
}
</style>
