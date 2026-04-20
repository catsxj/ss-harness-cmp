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
<script>
import { ref } from '@vue/composition-api'
import BannerItem from './BannerItem.vue'
import ContentItem from './ContentItem.vue'
import BrowserItem from './BrowserItem.vue'
import LoginItem from './LoginItem.vue'
import ScreenItem from './ScreenItem.vue'
import Alias from './Alias.vue'
import { getSystemConfigs } from 'services/system'
export default {
  components: {
    BannerItem,
    ContentItem,
    BrowserItem,
    LoginItem,
    ScreenItem,
    Alias
  },
  setup() {
    const configs = ref({})
    const loading = ref(true)
    async function getConfigs() {
      loading.value = true
      const res = await getSystemConfigs({ category: '界面配置' })
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
<style lang="scss" scoped></style>
