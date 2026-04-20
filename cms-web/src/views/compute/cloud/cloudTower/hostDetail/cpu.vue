<template>
  <div>
    <detail-map :detail="detailData" :list="detailMapList"></detail-map>
    <el-row :gutter="5">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import detailMap from 'views/components/detailMap.vue'
import { getCharts, getHostCpu } from 'services/monitor'
import chartBox from 'views/components/chartBox.vue'
export default {
  components: { detailMap, chartBox },
  props: {
    detailId: {
      type: Number
    },
    detailName: {
      type: String
    },
    address: {
      type: String
    },
    uuid: {
      type: String
    }
  },
  data() {
    return {
      detailData: {},
      typeData: [{ title: 'CPU利用率', value: 'usage', expr: JSON.stringify(['round(bocloud_cloudtower_host_host_cpu_overall_usage_percent{instanceId="' + this.uuid + '"}, 0.01)']), name: '["cpu利用率"]', unit: '%' }],
      detailMapList: [
        { name: 'CPU类型', value: 'cpuModel', unit: '' },
        { name: 'CPU核数', value: 'cpuCore', unit: '' },
        { name: 'CPU总量', value: 'cpuTotal', unit: 'MHZ' },
        { name: 'CPU使用量', value: 'cpuUsed', unit: 'MHZ' },
        { name: 'CPU空闲量', value: 'cpuFree', unit: 'MHZ' }
      ],
      dashboradData: {
        usage: {}
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
          this.detailData.cpuFree = this.detailData.cpuFree / 1000000
          this.detailData.cpuTotal = this.detailData.cpuTotal / 1000000
          this.detailData.cpuUsed = this.detailData.cpuUsed / 1000000
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
