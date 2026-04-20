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
import { getCharts, getHostMem } from 'services/monitor'
import chartBox from 'views/components/chartBox.vue'
export default {
  components: { detailMap, chartBox },
  props: {
    detailId: {
      type: Number
    },
    managerIp: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        { title: '内存利用率', value: 'usage', expr: JSON.stringify(['round(vsphere_host_mem_usage_average{esxhostname="' + this.managerIp + '"}, 0.01)']), name: "['内存利用率']", unit: '%' },
        { title: '内存使用量', value: 'active', expr: JSON.stringify(['round(1/1024*vsphere_host_mem_consumed_average{esxhostname="' + this.managerIp + '"}, 0.01)']), name: "['内存使用量']", unit: 'MB' },
        { title: '云主机内核使用的内存量', value: 'core', expr: JSON.stringify(['round(1/1024*vsphere_host_mem_sysUsage_average{esxhostname="' + this.managerIp + '"}, 0.01)']), name: "['云主机内核使用的内存量']", unit: 'MB' },
        { title: '平均共享公共内存', value: 'share', expr: JSON.stringify(['round(1/1024*vsphere_host_mem_shared_average{esxhostname="' + this.managerIp + '"}, 0.01)']), name: "['平均共享公共内存']", unit: 'MB' }
      ],
      detailData: {},
      detailMapList: [
        { name: '内存总量', value: 'memTotalCapacity', unit: 'GB' },
        { name: '内存使用量', value: 'memUsed', unit: 'GB' },
        { name: '内存空闲量', value: 'memFree', unit: 'GB' }
      ],
      dashboradData: {
        usage: {},
        active: {},
        core: {},
        share: {}
      },
      userDefindVisible: false,
      userDefindTime: []
    }
  },
  methods: {
    getDetail() {
      getHostMem(this.detailId).then((data) => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
        }
      })
    }
  },
  created() {
    this.getDetail()
    for (const key in this.dashboradData) {
      const element = this.dashboradData[key]
      this.$set(element, 'step', null)
      this.$set(element, 'stepValue', 20)
      this.$set(element, 'defindTime', [])
    }
  }
}
</script>
