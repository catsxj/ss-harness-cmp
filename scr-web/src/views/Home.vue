<template>
  <router-view></router-view>
</template>

<script>
import { onUnmounted } from '@vue/composition-api'
import { refreshToken, getAppInfo } from 'services/system'
import { setToken, getToken } from 'utils/auth'
export default {
  setup(props, context) {
    function getLastestToken() {
      const token = getToken()
      refreshToken({ token }).then((res) => {
        if (res.success) {
          setToken(res.data)
        } else {
          clearInterval(timer)
        }
      })
    }
    const timer = setInterval(() => {
      getLastestToken()
    }, 1000 * 30)
    onUnmounted(() => {
      clearInterval(timer)
    });
    context.root.$store.dispatch('GetScreenConfigs')
    // 设置title
    const setDocumentTitle = async () => {
      const systemCode = sessionStorage.getItem('systemCode');
      const systemTitle = sessionStorage.getItem('systemTitle');
      if (systemCode) {
        // const data = await getAppInfo(systemCode)
        // if (data.success) {
        //   document.title = data.data.name
        // }
      } else {
        document.title = systemTitle || '大屏展示'
      }
    }
    setDocumentTitle()
  }
}
</script>
