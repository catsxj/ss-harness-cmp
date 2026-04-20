<template>
  <div class="m-r">
    <LockOutlined class="cur-point" @click="lockScreen" />
  </div>
</template>

<script lang="ts">
import { replaceToken } from 'services'
import { setToken, getToken } from 'utils/auth'
import { computed, defineComponent, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { LockOutlined } from '@ant-design/icons-vue'

export default defineComponent({
  components: { LockOutlined },
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    let timer: any = 0
    function init() {
      store.commit('SET_OPERATETIME')
      let lockData = localStorage.getItem('lockData')
      if (lockData) {
        lockData = JSON.parse(lockData)
        if ((lockData as any).isLock) router.push({ name: 'LockMe' })
      }
    }
    init()
    // 获取最新token
    async function getLastToken() {
      const token = getToken()
      const res = await replaceToken({ token })
      if (res.success) {
        setToken(res.data)
      } else {
        clearTimer()
        store.dispatch('permission/ResetRoutes')
      }
    }
    function clearTimer() {
      clearInterval(timer)
      timer = 0
    }
    function lockScreen() {
      localStorage.setItem(
        'lockData',
        JSON.stringify({
          path: route.fullPath,
          isLock: true,
        })
      )
      router.push({ name: 'LockMe' })
    }
    // const userData = computed(() => store.getters.userData)
    // async function checkUserStatus() {
    //   const data = await checkUser(userData.value.id);
    //   if (!data.success) {
    //     clearTimer()
    //     context.root.$alert('用户已在其他地方登录，请确保您的账户安全 ', '提示', {
    //       confirmButtonText: '重新登录',
    //       callback: () => {
    //         store.dispatch('permission/ResetRoutes')
    //       }
    //     })
    //   }
    // }
    const operateTime = computed(() => store.state.app.operateTime)
    const lockScreenTime = computed(() => store.getters.systemConfig.lockScreenTime)
    onMounted(() => {
      timer = setInterval(() => {
        getLastToken()
        // 锁屏
        const interval = 1000 * 60 * Number(lockScreenTime.value)
        // checkUserStatus()
        if (interval && new Date().getTime() - operateTime.value >= interval) {
          lockScreen()
        }
      }, 1000 * 20)
    })
    onUnmounted(clearTimer)
    return {
      lockScreen,
    }
  },
})
</script>
<style scoped>
.lock {
  font-size: 20px;
  cursor: pointer;
}
</style>
