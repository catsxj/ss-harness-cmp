<template>
  <el-row>
    <el-col :span="24" class="m-b">
      <TimeSelect :get-data="init" class="m-l"></TimeSelect>
    </el-col>
    <el-col :span="24" class="chart-title">租户订单TOP5</el-col>
    <el-col :span="24" class="chart-content">
      <bar-charts :data="top5Data" v-if="top5Data" id="tenant_top5" width="100%" height="260px" :setting="chartSetting"> </bar-charts>
    </el-col>
    <el-col :span="24" class="chart-title">租户订单增长趋势</el-col>
    <el-col :span="24" class="chart-content">
      <line-charts :data="trendData" v-if="trendData" id="tenant_trend" width="100%" height="260px" :setting="chartSetting"> </line-charts>
    </el-col>
    <el-col :span="24" class="chart-title">租户订单数统计</el-col>
    <el-col :span="24" class="chart-content">
      <el-select v-model="params.tenantId" class="w m-l" filterable @change="getCount">
        <el-option value="" label="全部"></el-option>
        <el-option v-for="item in tenantList" :key="item.id" :value="item.id" :label="item.name"></el-option>
      </el-select>
      <bar-charts :data="countData" v-if="countData" id="tenant_count" width="100%" height="260px" :setting="chartSetting"></bar-charts>
    </el-col>
  </el-row>
</template>
<script>
import { chartSetting } from '@/views/cosa/configs'
import { getTenantsAz } from 'services/soa/order'
import { getTenant } from 'services/system/tenant'
export default {
  data() {
    return {
      params: {
        time: 'Months',
        tenantId: ''
      },
      top5Data: '',
      trendData: '',
      countData: '',
      tenantList: [],
      chartSetting
    }
  },
  created() {
    this.init()
    getTenant({ simple: true }).then((data) => {
      if (data.success) {
        this.tenantList = data.data.rows
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
      const data = await getTenantsAz({ ...this.params, ...params, condition: 'getTop5' })
      if (data.success) {
        const result = data.data
        result.keys.map((item, index) => {
          if (item === '其他') result.keys[index] = '云主机'
        })
        this.top5Data = result
      }
    },
    async getTrend(params) {
      const data = await getTenantsAz({ ...this.params, ...params, condition: 'getTrend' })
      if (data.success) {
        this.trendData = data.data
      }
    },
    async getCount(params) {
      const data = await getTenantsAz({ ...this.params, ...params, condition: 'countByVendor' })
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
