<template>
  <div class="wrapper" v-loading="loading">
    <el-row :gutter="15" v-if="!loading">
      <el-col :span="12" v-for="item in configs" :key="item.name">
        <CardItem :configs="item"></CardItem>
      </el-col>
    </el-row>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import CardItem from './interface/CardItem.vue'
import { getSystemTreeConfigs } from 'services/system'

interface ConfigItem {
  name: string
  values?: any[]
  [key: string]: unknown
}

const route = useRoute()
const configs = ref<ConfigItem[]>([])
const loading = ref(true)

async function getConfigs() {
  loading.value = true
  // TODO: i18n
  const res = await getSystemTreeConfigs({ category: (route.meta?.category as string) || '采集器主机配置' })
  loading.value = false
  if (res.success) {
    configs.value = res.data
  }
}
getConfigs()
</script>
<style lang="scss" scoped>
.wrapper {
  padding: 0 8px;
}
</style>
