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
<script>
import { ref } from '@vue/composition-api'
import CardItem from './CardItem.vue'
import { getSystemTreeConfigs } from 'services/system'
export default {
  components: {
    CardItem
  },
  setup() {
    const leftConfigs = ref([])
    const rightConfigs = ref([])
    const loading = ref(true)
    const leftKeys = ['企业微信配置', '钉钉配置', 'LDAP配置']
    async function getConfigs() {
      loading.value = true
      const res = await getSystemTreeConfigs({ category: '系统对接' })
      loading.value = false
      if (res.success) {
        res.data.forEach((item) => {
          if (leftKeys.includes(item.name)) {
            leftConfigs.value.push(item)
          } else {
            rightConfigs.value.push(item)
          }
        })
      }
    }
    getConfigs()
    const showTest = (name) => {
      return !['短信配置'].includes(name)
    }
    return {
      leftConfigs,
      rightConfigs,
      loading,
      showTest
    }
  }
}
</script>
<style lang="scss" scoped>
.wrapper {
  padding: 0 8px;
}
</style>
