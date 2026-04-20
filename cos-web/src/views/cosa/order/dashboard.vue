<template>
  <div class="wrapper" v-loading="loading">
    <el-row :gutter="10">
      <el-col :span="6">
        <StatisticsItem title="总订单" :count="data.totalNum.value"></StatisticsItem>
      </el-col>
      <el-col :span="6">
        <StatisticsItem title="周环比" :count="`${(Math.abs(data.weekRate.value) * 100).toFixed(2)} %`" :trend="data.weekRate.value < 0 ? 'down' : 'up'" :time="data.weekRate.time"> </StatisticsItem>
      </el-col>
      <el-col :span="6">
        <StatisticsItem title="日环比" :count="`${(Math.abs(data.dayRate.value) * 100).toFixed(2)} %`" :trend="data.dayRate.value < 0 ? 'down' : 'up'" :time="data.dayRate.time"></StatisticsItem>
      </el-col>
      <el-col :span="6">
        <StatisticsItem title="日订单" :count="data.dayNum.value" :time="data.dayNum.time"></StatisticsItem>
      </el-col>
    </el-row>
    <el-card class="m-t">
      <el-form inline>
        <el-form-item>
          <el-select v-model="params.vendorId" @change="getData" clearable>
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in vendorList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <TimeSelect ref="timeSelect" :get-data="getData"></TimeSelect>
        </el-form-item>
      </el-form>
    </el-card>
    <el-row :gutter="10">
      <el-col :span="8" v-for="item in configs" :key="item.key" class="m-t" :style="{ 'margin-top': 0 }">
        <rich-charts :style="{ 'margin-top': '15px' }" :title="item.title" :data="data[item.key]" height="260px" width="100%" v-if="data[item.key]" :setting="chartSetting"> </rich-charts>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import StatisticsItem from '../components/Statistics.vue'
import { getDashboard } from 'services/soa/order'
import { getCloudVendor } from 'services/platform/index'
export default {
  components: { StatisticsItem },
  data() {
    return {
      loading: false,
      vendorList: [],
      params: {
        time: '',
        vendorId: ''
      },
      data: {
        totalNum: {},
        dayNum: {},
        dayRate: { value: 0 },
        weekRate: { value: 0 }
      },
      chartSetting: {
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        richCount: 80,
        legendLength: 8
      },
      configs: [
        {
          title: '平台订单统计',
          key: 'vendorOrders'
        },
        {
          title: '租户订单统计',
          key: 'tenantOrders'
        },
        {
          title: '区域订单统计',
          key: 'regionOrders'
        },
        {
          title: '订单状态统计',
          key: 'statusOrders'
        },
        {
          title: '订单类型统计',
          key: 'typeOrders'
        },
        {
          title: '订单资源统计',
          key: 'resourceOrders'
        }
      ]
    }
  },
  mounted() {
    this.getData()
    this.getVendorList()
  },
  methods: {
    getVendorList() {
      getCloudVendor({
        simple: true,
        params: this.$tools.handleSearchParam({})
      }).then((data) => {
        if (data.success) {
          this.vendorList = data.data.rows
        }
      })
    },
    async getData(params = {}) {
      if (!params.time) {
        params = this.$refs.timeSelect && this.$refs.timeSelect.$data && this.$refs.timeSelect.$data.params
        console.log(this.$refs.timeSelect)
      }
      this.loading = true
      const data = await getDashboard({
        ...this.params,
        ...params
      })
      if (data.success) {
        const result = data.data
        result.vendorOrders.map((item) => {
          if (item.name === '其他') item.name = '云主机'
        })
        result.resourceOrders.map((item) => {
          if (item.name === '其他') item.name = '云主机'
        })
        this.data = result
      }
      this.loading = false
    }
  }
}
</script>
<style scoped lang="scss">
.wrapper {
  width: 100%;
  overflow-x: hidden;
}
</style>
