<template>
  <a-dropdown>
    <span class="m-r">
      <DesktopOutlined class="cur-point" />
    </span>
    <template #overlay>
      <a-menu>
        <router-link to="/personal/process_order">
          <a-menu-item>流程工单</a-menu-item>
        </router-link>
        <router-link to="/personal/service_work_order">
          <a-menu-item>问题工单</a-menu-item>
        </router-link>
      </a-menu>
    </template>
  </a-dropdown>
</template>
<script setup lang="ts">
import { DesktopOutlined } from '@ant-design/icons-vue'
</script>
