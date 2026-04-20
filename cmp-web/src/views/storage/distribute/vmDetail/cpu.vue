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
    },
    identifier: {
      type: String
    },
    address: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        {
          title: 'CPU利用率',
          value: 'usage',
          expr: JSON.stringify(['vsphere_vm_cpu_usage_average{cpu="instance-total",vmname="' + this.identifier + '",vcenter="' + this.address + '"}']),
          name: '["CPU利用率"]',
          unit: '%'
        },
        {
          title: 'cpu闲置时间',
          value: 'idle',
          expr: JSON.stringify(['1/1000*vsphere_vm_cpu_idle_summation{cpu="instance-total",vmname="' + this.identifier + '",vcenter="' + this.address + '"}']),
          name: '["cpu闲置时间"]',
          unit: 's'
        },
        {
          title: 'cpu滞后时间占比',
          value: 'latency',
          expr: JSON.stringify(['vsphere_vm_cpu_latency_average{vmname="' + this.identifier + '",vcenter="' + this.address + '"}']),
          name: '["cpu滞后时间占比"]',
          unit: '%'
        },
        {
          title: 'cpu系统进程使用时间',
          value: 'wait',
          expr: JSON.stringify(['1/1024*vsphere_vm_cpu_system_summation{vmname="' + this.identifier + '",vcenter="' + this.address + '"}']),
          name: '["cpu系统进程使用时间"]',
          unit: 's'
        }
      ],
      dashboradData: {
        usage: {},
        latency: {},
        wait: {},
        idle: {}
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
