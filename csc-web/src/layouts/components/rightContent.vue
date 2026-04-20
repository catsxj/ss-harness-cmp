/** * Created by HaijunZhang on 2019/12/18. */
<template>
  <div class="right-container">
    <router-link to="/recycle" class="icon">
      <i class="el-icon-delete"></i>
    </router-link>
    <site-message class="icon m-r"></site-message>
    <personal></personal>
    <!-- <router-link to="/service_quota" class="icon" v-if="userData.accountCategory === 'Tenant'">
      <i class="el-icon-pie-chart"></i>
    </router-link> -->
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted } from '@vue/composition-api'
import Personal from './personal/index.vue'
import SiteMessage from './SiteMessage.vue'
import { replaceToken } from 'services/system'
import { setToken, getToken } from 'utils/auth'

export default {
  components: {
    Personal,
    SiteMessage
  },
  setup(props, context) {
    // 获取最新token
    async function getLastToken() {
      const token = getToken()
      const res = await replaceToken({ token })
      if (res.success) {
        setToken(res.data)
      } else {
        clearTimer()
        context.root.$store.dispatch('permission/ResetRoutes')
      }
    }
    let timer = 0
    function clearTimer() {
      clearInterval(timer)
      timer = 0
    }
    onMounted(() => {
      timer = setInterval(() => {
        getLastToken()
      }, 1000 * 20)
    })
    onUnmounted(clearTimer)
    const userData = computed(() => context.root.$store.state.app.userData)
    return {
      userData
    }
  }
}
</script>
<style lang="scss" scoped>
.badge-item {
  position: relative;
  ::v-deep .el-badge__content.is-fixed {
    border: none;
    top: 16px !important;
    right: 20px;
  }
}
.right-container {
  display: flex;
  align-items: center;
}
.icon {
  font-size: 18px;
  color: #dcdcde;
  margin-right: 10px;
}
</style>
