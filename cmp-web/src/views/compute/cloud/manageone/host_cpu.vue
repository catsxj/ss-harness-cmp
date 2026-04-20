<template>
  <div>
    <el-row :gutter="5">
      <el-col :span="24" v-for="chart in typeData" :key="chart.value">
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
      type: String
    }
  },
  data() {
    return {
      typeData: [{ title: 'CPU利用率', value: 'usage', expr: JSON.stringify(['bocloud_fusioncloud_host_cpuUsage{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']), name: '["cpu利用率"]', unit: '%' }],
      dashboradData: {
        usage: {}
      },
      userDefindVisible: false,
      userDefindTime: []
    }
  },
  methods: {},
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
