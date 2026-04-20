<template>
  <el-col v-if="getUserType === 'Tenant'">
    <el-row :gutter="10">
      <el-col :span="8" v-for="item in countData" :key="item.name" class="m-t">
        <div class="card-dashboard">
          <div class="card-title">{{ item.name }}</div>
          <LiquidFillCard :title="item.name" :item="item"></LiquidFillCard>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col class="m-t">
        <div class="card-dashboard">
          <TimeSelect :get-data="getCharts" class="m-l"></TimeSelect>
        </div>
      </el-col>
    </el-row>
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
  </el-col>
</template>
<script>
import LiquidFillCard from './LiquidFillCard.vue'
import { getDashboard, getAz } from 'services/soa/tenant'
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
  computed: {
    getUserType() {
      return this.$store.state.app.userData.accountCategory
    }
  },
  created() {
    this.params.tenantId = this.$store.getters.userData.tenantId || this.$store.getters.userData.id
    this.getAll()
  },
  methods: {
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
      this.configs.forEach(item => {
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
<style scoped lang="scss">
.card-dashboard {
  background: #fff;
  padding: 15px;
  border-radius: 5px;
  color: #333;
  font-size: 12px;
  position: relative;
  .card-title {
    margin-bottom: 15px;
    font-size: 14px;
    font-weight: 700;
  }
  & > a {
    position: absolute;
    top: 20px;
    right: 20px;
    color: #277cfc;
    cursor: pointer;
  }
}
::v-deep .el-card {
  box-shadow: none !important;
  border-radius: 5px !important;
  .chart-header {
    font-size: 14px;
    font-weight: 700;
  }
}
</style>
