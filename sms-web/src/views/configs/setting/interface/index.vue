<template>
  <div class="wrapper" v-loading="loading">
    <el-row :gutter="15" v-if="!loading">
      <el-col :span="12">
        <CardItem :configs="item" v-for="item in leftConfigs" :key="item.name" :show-test="showTest(item.name)"></CardItem>
      </el-col>
      <el-col :span="12">
        <CardItem :configs="item" v-for="item in rightConfigs" :key="item.name" :show-test="showTest(item.name)"></CardItem>
      </el-col>
    </el-row>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import CardItem from './CardItem.vue'
import { getSystemTreeConfigs } from 'services/system'

interface ConfigItem {
  name: string
  values?: any[]
  [key: string]: unknown
}

const leftConfigs = ref<ConfigItem[]>([])
const rightConfigs = ref<ConfigItem[]>([])
const loading = ref(true)
// TODO: i18n
const leftKeys = ['企业微信配置', '钉钉配置', 'LDAP配置']

async function getConfigs() {
  loading.value = true
  // TODO: i18n
  const res = await getSystemTreeConfigs({ category: '系统对接' })
  loading.value = false
  if (res.success) {
    res.data.forEach((item: ConfigItem) => {
      if (leftKeys.includes(item.name)) {
        leftConfigs.value.push(item)
      } else {
        rightConfigs.value.push(item)
      }
    })
  }
}
getConfigs()

const showTest = (name: string): boolean => {
  // TODO: i18n
  return !['短信配置'].includes(name)
}
</script>
<style lang="scss" scoped>
.wrapper {
  padding: 0 8px;
}
</style>
