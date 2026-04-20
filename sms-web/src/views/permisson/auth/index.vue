<template>
  <el-card>
    <el-tabs>
      <el-tab-pane>
        <template #label><span class="tab-label-padding">管理端权限</span></template>
        <AdminAuth />
      </el-tab-pane>
      <el-tab-pane label="控制台权限" lazy>
        <template #label><span class="tab-label-padding">控制台权限</span></template>
        <ConsoleAuth />
      </el-tab-pane>
      <el-tab-pane label="功能权限" lazy>
        <template #label><span class="tab-label-padding">功能权限</span></template>
        <ApiAuth />
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script setup lang="ts">
import AdminAuth from './auth.vue'
import ConsoleAuth from './console_auth/index.vue'
import ApiAuth from './api_auth.vue'
</script>

<style lang="scss" scoped></style>
