<template>
  <el-row>
    <el-col :span="24" class="m-b">
      <TimeSelect :get-data="init" class="m-l"></TimeSelect>
    </el-col>
    <el-col :span="24" class="chart-title">平台订单TOP5</el-col>
    <el-col :span="24" class="chart-content">
      <bar-charts :data="top5Data" v-if="top5Data" id="top5" width="100%" height="260px" :setting="chartSetting"> </bar-charts>
    </el-col>
    <el-col :span="24" class="chart-title">平台订单增长趋势</el-col>
    <el-col :span="24" class="chart-content">
      <line-charts :data="trendData" v-if="trendData" id="trend" width="100%" height="260px" :setting="chartSetting"> </line-charts>
    </el-col>
    <el-col :span="24" class="chart-title">平台订单数统计</el-col>
    <el-col :span="24" class="chart-content">
      <bar-charts :data="countData" v-if="countData" id="count" width="100%" height="260px" :setting="chartSetting"></bar-charts>
    </el-col>
  </el-row>
</template>
<script>
import { chartSetting } from '@/views/cosa/configs'
import { getVendorsAz } from 'services/soa/order'
export default {
  data() {
    return {
      params: {
        time: 'Months'
      },
      top5Data: '',
      trendData: '',
      countData: '',
      chartSetting
    }
  },
  created() {
    this.init()
  },
  methods: {
    init(params = {}) {
      this.getTop5(params)
      this.getTrend(params)
      this.getCount(params)
    },
    async getTop5(params) {
      const data = await getVendorsAz({ ...this.params, ...params, condition: 'getTop5' })
      if (data.success) {
        const result = data.data
        result.keys.map((item, index) => {
          if (item === '其他') result.keys[index] = '云主机'
        })
        this.top5Data = result
      }
    },
    async getTrend(params) {
      const data = await getVendorsAz({ ...this.params, ...params, condition: 'getTrend' })
      if (data.success) {
        this.trendData = data.data
      }
    },
    async getCount(params) {
      const data = await getVendorsAz({ ...this.params, ...params, condition: 'countByVendor' })
      if (data.success) {
        const result = data.data
        result.keys.map((item, index) => {
          if (item === '其他') result.keys[index] = '云主机'
        })
        this.countData = result
      }
    }
  }
}
</script>
<style scoped>
.chart-title {
  padding: 15px;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}
.chart-content {
  padding: 10px;
}
</style>
