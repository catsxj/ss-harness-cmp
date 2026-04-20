<template>
  <el-row>
    <el-col :span="24" class="m-b">
      <TimeSelect :get-data="init" class="m-l"></TimeSelect>
    </el-col>
    <el-col :span="24" class="chart-title">订单状态增长趋势</el-col>
    <el-col :span="24" class="chart-content">
      <line-charts :data="trendData" v-if="trendData" id="status_trend" width="100%" height="260px" :setting="chartSetting"> </line-charts>
    </el-col>
    <el-col :span="24" class="chart-title">平台订单状态统计</el-col>
    <el-col :span="24" class="chart-content">
      <el-select v-model="params.status" class="w m-l" @change="getCount">
        <el-option value="" label="全部"></el-option>
        <el-option value="paid" label="已支付"></el-option>
        <el-option value="unpay" label="待支付"></el-option>
        <el-option value="audit" label="审批中"></el-option>
        <el-option value="canceld" label="已取消"></el-option>
      </el-select>
      <bar-charts :data="countData" v-if="countData" id="status_count" width="100%" height="260px" :setting="chartSetting"></bar-charts>
    </el-col>
  </el-row>
</template>
<script>
import { chartSetting } from '@/views/cosa/configs'
import { getStatusAz } from 'services/soa/order'
export default {
  data() {
    return {
      params: {
        time: 'Months',
        status: ''
      },
      trendData: '',
      countData: '',
      regionList: [],
      chartSetting
    }
  },
  created() {
    this.init()
  },
  methods: {
    init(params = {}) {
      this.getTrend(params)
      this.getCount(params)
    },
    async getTrend(params) {
      const data = await getStatusAz({ ...this.params, ...params, condition: 'getTrend' })
      if (data.success) {
        this.trendData = data.data
      }
    },
    async getCount(params) {
      const data = await getStatusAz({ ...this.params, ...params, condition: 'countByVendor' })
      if (data.success) {
        this.countData = data.data
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
