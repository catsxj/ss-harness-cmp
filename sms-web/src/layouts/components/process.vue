<template>
  <div class="process-apply">
    <el-dropdown trigger="click">
      <span class="m-r-md">
        <el-icon class="cur-point"><Monitor /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="goApply">流程工单</el-dropdown-item>
          <el-dropdown-item @click="goServiceWorkOrder">问题工单</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Monitor } from '@element-plus/icons-vue'

const router = useRouter()

function goApply(): void {
  router.push({ name: 'ProfileApplyPreview' })
}

function goServiceWorkOrder(): void {
  router.push({ name: 'ServiceWorkOrder' })
}
</script>

<style lang="scss">
.process-apply i {
  font-size: 18px;
}
.process-apply .el-icon {
  font-size: 18px;
}
</style>
