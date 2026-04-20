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
    detailName: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        {
          title: 'CPU利用率',
          value: 'first',
          expr: JSON.stringify(['round((1 - avg(irate(node_cpu_seconds_total{kubernetes_io_hostname="' + this.detailName + '",mode="idle"}[5m])) by (kubernetes_io_hostname))*100,0.01)']),
          name: '["CPU利用率"]',
          unit: '%'
        },
        {
          title: 'CPU使用情况',
          value: 'second',
          expr: JSON.stringify(['round((avg(irate(node_cpu_seconds_total{kubernetes_io_hostname="' + this.detailName + '"}[5m])) by (kubernetes_io_hostname,mode))*100,0.01)']),
          name: '["$mode"]',
          unit: '%'
        }
      ],
      dashboradData: {
        first: {},
        second: {}
      }
    }
  },
  beforeDestroy() {},
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
<style></style>
