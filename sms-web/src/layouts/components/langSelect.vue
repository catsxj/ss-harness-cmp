<template>
  <el-dropdown trigger="click" class="pull-right" @command="handleSetLanguage">
    <span class="lang-dropdown-link">
      {{ langLabel }}
      <el-icon class="el-icon--right"><ArrowDown /></el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="zh">中文</el-dropdown-item>
        <el-dropdown-item command="en">English</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores'

// TODO: i18n - vue-i18n@9 待启用，目前仅在 store 写入
const appStore = useAppStore()

const language = computed(() => appStore.language)
const langLabel = computed(() => (language.value === 'en' ? 'English' : '中文'))

function handleSetLanguage(lang: string): void {
  appStore.setLanguage(lang)
  // TODO: i18n - vue-i18n@9 待启用，此处仅写入 store
}
</script>

<style scoped lang="scss">
.lang-dropdown-link {
  float: right;
  font-size: 14px;
  color: #409eff;
  margin-right: 5px;
  cursor: pointer;
}
</style>
