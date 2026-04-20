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
import detailMap from 'views/monitor/components/detailMap.vue'
import { getCharts, getHostCpu } from 'services/monitor'
import chartBox from 'views/monitor/components/chartBox.vue'
export default {
  components: { detailMap, chartBox },
  props: {
    detailId: {
      type: Number
    },
    detailUuid: {
      type: String
    },
    detailVendorId: {
      type: Number
    }
  },
  data() {
    return {
      detailData: {},
      typeData: [{ title: 'CPU利用率', value: 'usage', expr: JSON.stringify(['round(cnware_host_cpu_usage_average{uuid="' + this.detailUuid + '",vendorId="' + this.detailVendorId + '"}, 0.01)']), name: '["cpu利用率"]', unit: '%' }],
      detailMapList: [
        { name: 'CPU类型', value: 'cpuModel', unit: '' },
        { name: 'CPU数量', value: 'cpuAmount', unit: '' },
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
