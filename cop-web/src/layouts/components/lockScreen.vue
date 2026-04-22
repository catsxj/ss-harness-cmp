<template>
  <div class="m-r-md">
    <i class="el-icon-lock lock" @click="lockScreen"></i>
  </div>
</template>

<script>
import { getSystemConfigs, replaceToken } from 'services/system'
import { setToken, getToken } from 'utils/auth'
import { computed, onMounted, onUnmounted, reactive, toRefs } from '@vue/composition-api'

export default {
  setup(props, context) {
    const state = reactive({
      timer: 0
    });
    function init() {
      context.root.$store.commit('SET_OPERATETIME')
      let lockData = localStorage.getItem('lockData')
      if (lockData) {
        lockData = JSON.parse(lockData)
        if (lockData.isLock) context.root.$router.push({ name: 'LockMe' })
      }
    }
    init();
    // 获取最新token
    async function getLastToken () {
      const token = getToken()
      const res = await replaceToken({ token });
      if (res.success) {
        setToken(res.data)
      } else {
        clearTimer()
        context.root.$store.dispatch('permission/ResetRoutes')
      }
    };
    function clearTimer() {
      clearInterval(state.timer);
      state.timer = 0;
    }
    function lockScreen() {
      localStorage.setItem(
        'lockData',
        JSON.stringify({
          path: context.root.$route.fullPath,
          isLock: true
        })
      )
      context.root.$router.push({ name: 'LockMe' })
    };
    const userData = computed(() => context.root.$store.getters.userData)
    // async function checkUserStatus() {
    //   const data = await checkUser(userData.value.id);
    //   if (!data.success) {
    //     clearTimer()
    //     context.root.$alert('用户已在其他地方登录，请确保您的账户安全 ', '提示', {
    //       confirmButtonText: '重新登录',
    //       callback: () => {
    //         context.root.$store.dispatch('permission/ResetRoutes')
    //       }
    //     })
    //   }
    // }
    const operateTime = computed(() => context.root.$store.state.app.operateTime);
    const lockScreenTime = computed(() => context.root.$store.getters.systemConfig.lockScreenTime);
    onMounted(() => {
      state.timer = setInterval(() => {
        getLastToken();
        // 锁屏
        const interval = 1000 * 60 * Number(lockScreenTime.value)
        // checkUserStatus()
        if (interval && new Date().getTime() - operateTime.value >= interval) {
          lockScreen()
        }
      }, 1000 * 20)
    });
    onUnmounted(clearTimer);
    return {
      ...toRefs(state),
      lockScreen
    }
  }
}
</script>
<style scoped>
.lock {
  font-size: 20px;
  cursor: pointer;
}
</style>
