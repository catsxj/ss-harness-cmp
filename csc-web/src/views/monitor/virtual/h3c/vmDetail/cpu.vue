<template>
  <el-row :gutter="5">
    <el-col :span="12" v-for="chart in typeData" :key="chart.value">
      <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
    </el-col>
  </el-row>
</template>
<script>
import chartBox from 'views/monitor/components/chartBox.vue'
export default {
  components: { chartBox },
  props: {
    detailId: {
      type: [Number, String]
    },
    instanceId: {
      type: [Number, String]
    },
    identifier: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        {
          title: 'CPU利用率',
          value: 'usage',
          expr: JSON.stringify(['round(h3c_vm_cpu_rate{name="' + this.identifier + '",id="' + this.instanceId + '"},0.01)']),
          name: "['CPU利用率']",
          unit: '%'
        }
      ],
      dashboradData: {
        usage: {}
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
