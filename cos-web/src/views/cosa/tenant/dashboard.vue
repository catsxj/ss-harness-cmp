<template>
  <div class="wrapper" v-loading="loading">
    <el-card class="m-t">
      <el-form inline>
        <el-form-item>
          <el-select v-model="params.tenantId" @change="getAll()" filterable clearable>
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in tenantList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="exportData">配额使用率导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-row :gutter="10">
      <el-col :span="8" v-for="item in countData" :key="item.name" class="m-t">
        <LiquidFillCard :title="item.name" :item="item"></LiquidFillCard>
      </el-col>
    </el-row>
    <el-card class="m-t">
      <el-form inline>
        <el-form-item>
          <TimeSelect :get-data="getCharts" class="m-l"></TimeSelect>
        </el-form-item>
      </el-form>
    </el-card>
    <el-row :gutter="10">
      <el-col :span="item.span || 24" class="m-t" v-for="item in configs" :key="item.key">
        <rich-charts :title="item.title" :default-chart="item.componet" :data="item.data" height="260px" width="100%" v-if="item.data">
          <el-select v-model="params.resourceType" class="w m-l" @change="getCount(item)" v-if="item.showSelect">
            <el-option value="meta.cpu" label="CPU"></el-option>
            <el-option value="meta.mem" label="内存"></el-option>
            <el-option value="meta.disk" label="存储"></el-option>
          </el-select>
        </rich-charts>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import LiquidFillCard from '../components/LiquidFillCard.vue'
import { chartSetting } from '@/views/cosa/configs'
import { getDashboard, getAz, exportTenant } from 'services/soa/tenant'
import { getTenant } from 'services/system/tenant'
export default {
  components: { LiquidFillCard },
  data() {
    return {
      loading: false,
      countData: [],
      params: {
        resourceType: 'meta.cpu',
        tenantId: ''
      },
      chartSetting,
      tenantList: [],
      configs: [
        {
          title: '容量使用趋势',
          showSelect: true,
          componet: 'line-charts',
          data: '',
          key: 'getResourceTend'
        },
        {
          title: '资源TOP5',
          componet: 'bar-charts',
          data: '',
          key: 'getTop5'
        },
        {
          title: '租户订单趋势',
          componet: 'line-charts',
          data: '',
          key: 'getOrderTrend'
        },
        {
          title: '服务申请趋势',
          componet: 'line-charts',
          data: '',
          key: 'getServiceApply'
        }
      ]
    }
  },
  created() {
    this.getAll()
    getTenant({ simple: true }).then((data) => {
      if (data.success) {
        this.tenantList = data.data.rows
      }
    })
  },
  methods: {
    exportData() {
      exportTenant()
    },
    async getCountData() {
      this.loading = true
      const data = await getDashboard(this.params)
      if (data.success) {
        this.countData = data.data
      }
      this.loading = false
    },
    getAll(type) {
      this.getCountData()
      this.getCharts()
    },
    getCharts(params = {}) {
      this.params = {
        ...this.params,
        ...params
      }
      this.configs.forEach((item) => {
        this.getCount(item)
      })
    },
    async getCount(item) {
      this.loading = true
      const data = await getAz({
        ...this.params,
        condition: item.key
      })
      if (data.success) {
        item.data = data.data
      }
      this.loading = false
    }
  }
}
</script>
