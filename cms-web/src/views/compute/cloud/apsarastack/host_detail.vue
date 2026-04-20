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
      type: String
    },
    paramsStr: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      typeData: [
        {
          title: 'CPU利用率',
          expr: JSON.stringify([`round(apsarastack_host_cpuAvg{${this.paramsStr}},0.01)`]),
          name: "['CPU利用率']",
          unit: '%',
          value: 'cpu'
        },
        {
          title: '内存利用率',
          expr: JSON.stringify([`round(apsarastack_host_memAvg{${this.paramsStr}},0.01)`]),
          name: "['内存利用率']",
          unit: '%',
          value: 'mem'
        },
        {
          title: '磁盘利用率',
          expr: JSON.stringify([`round(apsarastack_host_diskAvg{${this.paramsStr}},0.01)`]),
          name: "['磁盘利用率']",
          unit: '%',
          value: 'disk'
        }
      ],
      dashboradData: {
        cpu: {},
        mem: {},
        disk: {}
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
