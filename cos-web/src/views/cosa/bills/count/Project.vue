<template>
  <div class="wrapper" v-loading="loading">
    <TimeSelect :get-data="getData" @exportData="exportData"></TimeSelect>
    <el-row :gutter="10">
      <el-col :span="24" class="m-t">
        <rich-charts :title="$store.getters.systemConfig.projectConfigLabel + '账单总额'" :setting="chartSetting" :data="list[0]" default-chart="loop-charts" v-if="list"> </rich-charts>
      </el-col>
      <el-col :span="24" class="m-t">
        <rich-charts :title="$store.getters.systemConfig.projectConfigLabel + '账单趋势'" :data="list[1]" default-chart="line-charts" v-if="list"> </rich-charts>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import Minxi from './common/minxi.js'
export default {
  mixins: [Minxi],
  data() {
    return {
      condition: 'project',
      chartSetting: {
        richCount: 160
      }
    }
  },
  created() {
    this.getData()
  }
}
</script>
<style scoped lang="scss">
.wrapper {
  width: 100%;
  overflow-x: hidden;
}
</style>
