<template>
  <el-row>
    <el-col :span="24" class="m-b">
      <TimeSelect :get-data="init" class="m-l"></TimeSelect>
    </el-col>
    <el-col :span="24" class="chart-title">订单类型增长趋势</el-col>
    <el-col :span="24" class="chart-content">
      <line-charts :data="trendData" v-if="trendData" id="type_trend" width="100%" height="260px" :setting="chartSetting"> </line-charts>
    </el-col>
    <el-col :span="24" class="chart-title">平台订单类型统计</el-col>
    <el-col :span="24" class="chart-content">
      <el-select v-model="params.type" class="w m-l" @change="getCount">
        <el-option value="" label="全部"></el-option>
        <el-option value="PreCharge" label="预付费"></el-option>
        <el-option value="PostCharge" label="后付费"></el-option>
      </el-select>
      <bar-charts :data="countData" v-if="countData" id="type_count" width="100%" height="260px" :setting="chartSetting"></bar-charts>
    </el-col>
  </el-row>
</template>
<script>
import { chartSetting } from '@/views/cosa/configs'
import { getTypesAz } from 'services/soa/order'
export default {
  data() {
    return {
      params: {
        time: 'Months',
        type: ''
      },
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
      this.getTrend(params)
      this.getCount(params)
    },
    async getTrend(params) {
      const data = await getTypesAz({ ...this.params, ...params, condition: 'getTrend' })
      if (data.success) {
        this.trendData = data.data
      }
    },
    async getCount(params) {
      const data = await getTypesAz({ ...this.params, ...params, condition: 'countByVendor' })
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
