<template>
  <div class="wrapper" v-loading="loading">
    <el-row :gutter="15" v-if="!loading">
      <el-col :span="12" v-for="item in configs" :key="item.name">
        <CardItem :configs="item"></CardItem>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { ref } from '@vue/composition-api'
import CardItem from './interface/CardItem.vue'
import { getSystemTreeConfigs } from 'services/system'
export default {
  components: {
    CardItem
  },
  setup(props, context) {
    const configs = ref([])
    const loading = ref(true)
    async function getConfigs() {
      loading.value = true
      const res = await getSystemTreeConfigs({ category: context.root.$route.meta.category || '采集器主机配置' })
      loading.value = false
      if (res.success) {
        configs.value = res.data
      }
    }
    getConfigs()
    return {
      configs,
      loading
    }
  }
}
</script>
<style lang="scss" scoped>
.wrapper {
  padding: 0 8px;
}
</style>
