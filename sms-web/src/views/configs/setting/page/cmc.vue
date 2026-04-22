<template>
  <div v-loading="loading">
    <el-row :gutter="15" v-if="!loading">
      <el-col :span="12">
        <BannerItem :itemData="configs"></BannerItem>
        <ContentItem :itemData="configs"></ContentItem>
        <BrowserItem :itemData="configs" />
        <Alias :itemData="configs" />
      </el-col>
      <el-col :span="12">
        <LoginItem :itemData="configs"></LoginItem>
        <ScreenItem :itemData="configs" />
      </el-col>
    </el-row>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import BannerItem from './BannerItem.vue'
import ContentItem from './ContentItem.vue'
import BrowserItem from './BrowserItem.vue'
import LoginItem from './LoginItem.vue'
import ScreenItem from './ScreenItem.vue'
import Alias from './Alias.vue'
import { getSystemConfigs } from 'services/system'

const configs = ref<Record<string, any>>({})
const loading = ref(true)

async function getConfigs() {
  loading.value = true
  // TODO: i18n
  const res = await getSystemConfigs({ category: '界面配置' })
  loading.value = false
  if (res.success) {
    configs.value = res.data
  }
}
getConfigs()
</script>
<style lang="scss" scoped></style>
