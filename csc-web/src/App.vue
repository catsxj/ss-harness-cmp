<template>
  <div id="app" @click="setTime">
    <router-view></router-view>
    <el-dialog title="提示" :show-close="false" :visible.sync="dialogVisible" width="30%">
      <el-alert title="温馨提示" type="error" :closable="false" description="请注意，您正在使用的是#石器#浏览器，为了更好的用户体验，建议更换谷歌、火狐等现代浏览器"> </el-alert>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { onMounted, ref, getCurrentInstance } from '@vue/composition-api'

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
        el.parentElement.removeChild(el)
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
