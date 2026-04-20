<template>
  <el-card>
    <el-tabs>
      <el-tab-pane>
        <span slot="label" class="tab-label-padding">管理端权限</span>
        <AdminAuth />
      </el-tab-pane>
      <el-tab-pane label="控制台权限" lazy>
        <span slot="label" class="tab-label-padding">控制台权限</span>
        <ConsoleAuth />
      </el-tab-pane>
      <el-tab-pane label="功能权限" lazy>
        <span slot="label" class="tab-label-padding">功能权限</span>
        <ApiAuth />
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import AdminAuth from './auth.vue'
import ConsoleAuth from './console_auth/index.vue'
import ApiAuth from './api_auth.vue'

export default {
  components: {
    AdminAuth,
    ConsoleAuth,
    ApiAuth
  }
}
</script>
<style lang="scss" scoped></style>
