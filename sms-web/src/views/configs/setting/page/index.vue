<template>
  <el-card>
    <el-tabs ref="tab" model-value="cmc">
      <el-tab-pane name="cmc" lazy>
        <template #label>
          <!-- TODO: i18n -->
          <span class="tab-label-padding">管理端界面</span>
        </template>
        <cmc-page></cmc-page>
      </el-tab-pane>
      <el-tab-pane name="csc" lazy>
        <template #label>
          <!-- TODO: i18n -->
          <span class="tab-label-padding">控制台界面</span>
        </template>
        <csc-page></csc-page>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>
<script setup lang="ts">
import CmcPage from './cmc.vue'
import CscPage from './csc.vue'
</script>
