<template>
  <div>
    <detail-map :detail="detailData" :list="detailMapList"></detail-map>
    <el-row :gutter="20">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import detailMap from '../detailMap'
import { getCharts, getHostCpu } from 'services/monitor'
import chartBox from 'views/components/chartBox.vue'
export default {
  components: { detailMap, chartBox },
  props: {
    detailId: {
      type: Number
    },
    managerIp: {
      type: String
    },
    address: {
      type: String
    }
  },
  data() {
    return {
      detailData: {},
      typeData: [
        { title: 'CPU利用率', value: 'usage', expr: JSON.stringify(['round(vsphere_host_cpu_usage_average{cpu="instance-total",esxhostname="' + this.managerIp + '"}, 0.01)']), name: '["cpu利用率"]', unit: '%' },
        { title: 'cpu内核利用率', value: 'core', expr: JSON.stringify(['vsphere_host_cpu_coreUtilization_average{cpu="instance-total",esxhostname="' + this.managerIp + '"}']), name: '["cpu内核利用率"]', unit: '%' },
        { title: 'cpu等待总时间', value: 'wait', expr: JSON.stringify(['1/1000*vsphere_host_cpu_wait_summation{esxhostname="' + this.managerIp + '"}']), name: '["cpu等待总时间"]', unit: 's' },
        { title: 'cpu闲置时间', value: 'idle', expr: JSON.stringify(['1/1000*vsphere_host_cpu_idle_summation{cpu="instance-total",esxhostname="' + this.managerIp + '"}']), name: '["cpu闲置时间"]', unit: 's' }
      ],
      detailMapList: [
        { name: 'CPU类型', value: 'cpuModel', unit: '' },
        { name: 'CPU数量', value: 'cpuAmount', unit: '' },
        { name: 'CPU核数', value: 'cpuCore', unit: '' },
        { name: 'CPU总量', value: 'cpuTotal', unit: 'MHZ' },
        { name: 'CPU使用量', value: 'cpuUsed', unit: 'MHZ' },
        { name: 'CPU空闲量', value: 'cpuFree', unit: 'MHZ' }
      ],
      dashboradData: {
        usage: {},
        core: {},
        wait: {},
        idle: {}
      },
      userDefindVisible: false,
      userDefindTime: []
    }
  },
  methods: {
    getCpu() {
      getHostCpu(this.detailId).then((data) => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
        }
      })
    }
  },
  created() {
    for (const key in this.dashboradData) {
      const element = this.dashboradData[key]
      this.$set(element, 'step', null)
      this.$set(element, 'stepValue', 20)
      this.$set(element, 'defindTime', [])
    }
    this.getCpu()
  }
}
</script>
