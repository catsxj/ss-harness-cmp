<template>
  <div>
    <el-row :gutter="5">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import chartBox from 'views/components/chartBox.vue'
export default {
  components: { chartBox },
  props: {
    detailId: {
      type: Number
    }
  },
  data() {
    return {
      typeData: [{ title: '磁盘使用速率', value: 'usage', expr: JSON.stringify(['round(bocloud_inspurRail_host_STORAGE{id="' + this.detailId + '"},0.01)']), name: "['磁盘使用速率']", unit: 'KB/s' }],
      dashboradData: {
        usage: {}
      },
      userDefindVisible: false,
      userDefindTime: []
    }
  },
  created() {
    for (const key in this.dashboradData) {
      const element = this.dashboradData[key]
      this.$set(element, 'step', null)
      this.$set(element, 'stepValue', 20)
      this.$set(element, 'defindTime', [])
    }
  }
}
</script>
