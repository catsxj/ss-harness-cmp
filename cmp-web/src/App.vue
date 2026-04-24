<template>
  <div id="app" @click="setTime">
    <router-view></router-view>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'

export default {
  setup(props, context) {
    const dialogVisible = ref(false)
    context.root.$store.dispatch('GetPageConfigs')
    onMounted(() => {
      // 偶发后退无效问题 hack
      window.addEventListener(
        'hashchange',
        () => {
          const currentPath = window.location.hash.slice(1)
          if (context.root.$route.path !== currentPath) {
            context.root.$router.push(currentPath)
          }
        },
        false
      )
      // 移除loading
      setTimeout(() => {
        const el = document.getElementsByClassName('loading')[0]
        if (el && el.parentElement) {
          el.parentElement.removeChild(el)
        }
      }, 1000 * 2)
    })
    function judgeAgent() {
      if (window.navigator.userAgent.indexOf('MSIE') > 0) {
        dialogVisible.value = true
      }
    }
    function setTime() {
      context.root.$store.commit('SET_OPERATETIME')
    }
    judgeAgent()
    return {
      dialogVisible,
      setTime
    }
  }
}
</script>
<style lang="scss">
@import './common/css/index.scss';
</style>
