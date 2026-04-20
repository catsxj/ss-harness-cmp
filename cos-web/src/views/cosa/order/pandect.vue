<template>
  <el-card>
    <el-row :gutter="10" class="m-t-xs">
      <el-row :gutter="5" class="m-t-xs">
        <el-col :span="24">
          <el-form :inline="true">
            <el-form-item>
              <el-date-picker v-model="date" value-format="yyyy-MM-dd HH:mm:ss" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"> </el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-select v-model="tenantId" placeholder="请选择租户" @change="handleChange" clearable>
                <el-option v-for="item in tenantList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="ghost" icon="el-icon-search" @click="search">搜索</el-button>
              <el-button type="ghost" icon="el-icon-refresh" @click="reset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row :gutter="5" class="m-t-xs">
        <el-col :span="8">
          <el-card>
            <div slot="header">
              订单支付统计
              <span style="float: right">订单总数: {{ total }}</span>
            </div>
            <bar-charts ref="tasks" height="300px" width="100%" id="orderPaidOverview" :data="orderPaidOverview" v-if="orderPaidOverview"></bar-charts>
          </el-card>
        </el-col>
        <el-col :span="16">
          <el-card>
            <div slot="header">订单支付趋势统计</div>
            <line-charts v-if="orderPaidTrend" theme="订单增长趋势统计:" ref="chart2" height="300px" width="100%" id="orderPaidTrend" :data="orderPaidTrend" :setting="{ color: ['#19BE6B', '#2D8CF0', '#696BD8', '#ff6600'] }"></line-charts>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="5" class="m-t-xs">
        <el-col :span="24">
          <el-card>
            <div slot="header">订单类型统计</div>
            <bar-charts ref="tasks" height="220px" width="100%" id="orderCategoryOverview" :data="orderCategoryOverview" v-if="orderCategoryOverview"></bar-charts>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="5" class="m-t-xs">
        <el-col :span="12">
          <el-card>
            <div slot="header">订单状态统计</div>
            <pie-charts height="230px" id="orderStatusOverview" width="100%" :data="orderStatusOverview" theme="订单状态统计" v-if="orderStatusOverview"></pie-charts>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <div slot="header">订单付费类型统计</div>
            <pie-charts height="230px" id="taskResultPie" width="100%" :data="orderChargeModeOverview" theme="订单付费类型统计" v-if="orderChargeModeOverview"></pie-charts>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="5" class="m-t-xs">
        <el-col :span="12">
          <el-card>
            <div slot="header">租户订单数TOP5</div>
            <bar-charts ref="tasks" height="300px" width="100%" id="tenantOrdersTop5" :data="tenantOrdersTop5" v-if="tenantOrdersTop5"></bar-charts>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <div slot="header">用户订单TOP5</div>
            <bar-charts ref="tasks" height="300px" width="100%" id="userOrdersTop5" :data="userOrdersTop5" v-if="userOrdersTop5"></bar-charts>
          </el-card>
        </el-col>
      </el-row>
      <!-- <h4>订单总数</h4>
      <pie-charts theme="订单总数:" ref="chart1" height="300px" width="90%" id="totalOrders" :data="totalOrders" :setting="pieConfig1" v-if="totalOrders.values"></pie-charts>
      <el-col :span="8">
        <h4>订单状态趋势统计</h4>
        <line-charts theme="订单状态趋势统计:" ref="chart3" height="300px" width="90%" id="stateTrend" :data="stateTrend" v-if="stateTrend.values"></line-charts>
      </el-col>
      <el-col :span="8">
        <h4>租户订单数TOP5</h4>
        <bar-charts theme="租户订单数TOP5:" ref="chart4" height="300px" width="90%" id="tenantTop5" :data="tenantTop5" :setting="{ color: ['#2d8cf0', '#ff0000', '#ff0000', '#ff9900'] }" v-if="tenantTop5.values"></bar-charts>
      </el-col>
      <el-col :span="8">
        <h4>地域订单数TOP5</h4>
        <bar-charts theme="地域订单数TOP5:" ref="chart5" height="300px" width="90%" id="zoneTop5" :data="zoneTop5" :setting="{ color: ['#2d8cf0', '#ff0000', '#ff0000', '#ff9900'] }" v-if="zoneTop5.values"></bar-charts>
      </el-col>
      <el-col :span="8">
        <h4>订单状态分布</h4>
        <pie-charts theme="订单状态分布:" ref="chart6" height="300px" width="90%" id="orderPie" :data="orderPie" :setting="pieConfig" v-if="orderPie.values"></pie-charts>
      </el-col> -->
    </el-row>
  </el-card>
</template>

<script>
import { getTenant } from 'services/system/tenant'
import { conditionOrder } from 'services/services/order'

const pieConfig = {
  color: ['#2d8cf0', '#ff0000', '#f90', '#3c3'],
  richCount: 100,
  legend: {
    orient: 'horizontal',
    top: 20,
    left: 0,
    itemGap: 20
  },
  center: ['50%', '50%']
}

const pieConfig1 = {
  color: ['#2d8cf0', '#ff0000', '#f90', '#3c3'],
  legend: {
    right: 0
  },
  radius: ['40%', '50%'],
  center: ['25%', '50%']
}
export default {
  data() {
    return {
      pieConfig,
      pieConfig1,
      date: [],
      tenantId: '',
      tenantList: [],
      orderPaidOverview: '',
      orderPaidTrend: '',
      orderCategoryOverview: '',
      orderStatusOverview: '',
      orderChargeModeOverview: '',
      tenantOrdersTop5: '',
      userOrdersTop5: '',
      total: 0
    }
  },
  created() {
    getTenant({ simple: true }).then((data) => {
      if (data.success) {
        this.tenantList = data.data.rows
      }
    })
    this.search()
  },
  methods: {
    handleChange() {
      this.search()
    },
    reset() {
      this.date = []
      this.tenantId = ''
      this.search()
    },
    search() {
      this.getOrder('orderPaidOverview', 'orderPaidOverview')
      this.getOrder('orderPaidTrend', 'orderPaidTrend')
      this.getOrder('orderCategoryOverview', 'orderCategoryOverview')
      this.getOrder('orderStatusOverview', 'orderStatusOverview')
      this.getOrder('orderChargeModeOverview', 'orderChargeModeOverview')
      this.getOrder('tenantOrdersTop5', 'tenantOrdersTop5')
      this.getOrder('userOrdersTop5', 'userOrdersTop5')
    },
    getOrder(condition, list) {
      const obj = {
        condition: condition,
        tenantId: this.tenantId
      }
      if (this.date) obj.start = this.date[0]
      if (this.date) obj.end = this.date[1]
      conditionOrder({
        condition: JSON.stringify(obj)
      }).then((data) => {
        if (data.success) {
          this[list] = data.data
          if (list === 'orderPaidOverview') {
            this.total = 0
            data.data.values.map((item) => {
              console.log(item)
              item.data.map((it) => {
                this.total += it
              })
            })
          }
        }
      })
    }
  }
}
</script>
<style scoped>
.status-icon {
  margin-top: -2px;
}
.m-r-xxl {
  margin-right: 50px;
}
</style>
