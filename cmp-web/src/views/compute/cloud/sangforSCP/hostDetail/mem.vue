<template>
  <div>
    <el-row :gutter="20">
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
    },
    detailUuid: {
      type: String
    }
  },
  data() {
    return {
      typeData: [{ title: '内存利用率', value: 'usage', expr: JSON.stringify(['round(sangfor_Host_mem_usage_average{instanceId="' + this.detailUuid + '"}, 0.01)']), name: "['内存利用率']", unit: '%' }],
      detailData: {},
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
