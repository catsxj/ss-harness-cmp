<template>
  <el-row>
    <el-col :span="24" class="m-b">
      <TimeSelect :get-data="init" class="m-l"></TimeSelect>
    </el-col>
    <el-col :span="24" class="chart-title">资源订单TOP5</el-col>
    <el-col :span="24" class="chart-content">
      <bar-charts :data="top5Data" v-if="top5Data" id="resource_top5" width="100%" height="260px" :setting="chartSetting"> </bar-charts>
    </el-col>
    <el-col :span="24" class="chart-title">资源订单增长趋势</el-col>
    <el-col :span="24" class="chart-content">
      <line-charts :data="trendData" v-if="trendData" id="resource_trend" width="100%" height="260px" :setting="chartSetting"> </line-charts>
    </el-col>
    <el-col :span="24" class="chart-title">资源订单数统计</el-col>
    <el-col :span="24" class="chart-content">
      <el-select v-model="params.serviceCode" class="w m-l" @change="getCount">
        <el-option value="" label="全部"></el-option>
        <el-option v-for="item in serviceList" :key="item.code" :value="item.code" :label="item.name"></el-option>
      </el-select>
      <bar-charts :data="countData" v-if="countData" id="resource_count" width="100%" height="260px" :setting="chartSetting"></bar-charts>
    </el-col>
  </el-row>
</template>
<script>
import { chartSetting } from '@/views/cosa/configs'
import { getResourcesAz } from 'services/soa/order'
import { getService } from 'services/services/service'
export default {
  data() {
    return {
      params: {
        time: 'Months',
        serviceCode: ''
      },
      top5Data: '',
      trendData: '',
      countData: '',
      serviceList: [],
      chartSetting
    }
  },
  created() {
    this.init()
    getService({ page: 1, rows: 100000 }).then((data) => {
      if (data.success) {
        this.serviceList = data.data.rows
      }
    })
  },
  methods: {
    init(params = {}) {
      this.getTop5(params)
      this.getTrend(params)
      this.getCount(params)
    },
    async getTop5(params) {
      const data = await getResourcesAz({ ...this.params, ...params, condition: 'getTop5' })
      if (data.success) {
        this.top5Data = data.data
      }
    },
    async getTrend(params) {
      const data = await getResourcesAz({ ...this.params, ...params, condition: 'getTrend' })
      if (data.success) {
        this.trendData = data.data
      }
    },
    async getCount(params) {
      const data = await getResourcesAz({ ...this.params, ...params, condition: 'countByVendor' })
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
