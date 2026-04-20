<template>
  <el-card>
    <el-row :gutter="10">
      <el-col :span="24">
        <!-- <el-form :inline="true">
          <el-form-item>
            <el-date-picker v-model="date" value-format="yyyy-MM-dd HH:mm:ss" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"> </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-select v-model="tenantId" placeholder="请选择租户" clearable>
              <el-option v-for="item in tenantList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="ghost" icon="el-icon-search" @click="search">搜索</el-button>
          </el-form-item>
        </el-form> -->
      </el-col>
      <el-row :gutter="5" class="m-t-xs">
        <el-col :span="8">
          <el-card>
            <div slot="header">租户消费总计</div>
            <div style="line-height: 5; text-align: center; height: 220px">
              <span style="font-size: 40px">{{ totalBills }}</span
              >元
            </div>
          </el-card>
        </el-col>
        <el-col :span="16">
          <el-card>
            <div slot="header">租户消费趋势统计</div>
            <line-charts v-if="incomeTrend" theme="租户消费趋势统计:" ref="chart2" height="220px" width="100%" id="incomeTrend" :data="incomeTrend"></line-charts>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="5" class="m-t-xs">
        <el-col :span="24">
          <el-card>
            <div slot="header">产品消费统计（单位：元）</div>
            <bar-charts v-if="productIncome" ref="tasks" height="220px" width="100%" id="productIncome" :data="productIncome"></bar-charts>
          </el-card>
        </el-col>
      </el-row>
      <!-- 王翔 11-06 -->
      <!-- <el-row :gutter="5" class="m-t-xs">
        <el-col :span="24">
          <el-card>
            <div slot="header">产品消费趋势统计</div>
            <line-charts v-if="productTrend" theme="产品消费趋势统计:" ref="chart3" height="300px" width="100%" id="productTrend" :data="productTrend"></line-charts>
          </el-card>
        </el-col>
      </el-row> -->
      <el-row :gutter="5" class="m-t-xs">
        <el-col :span="12">
          <el-card>
            <div slot="header">租户消费TOP5</div>
            <bar-charts v-if="tenantTop5" theme="租户消费TOP5:" ref="chart4" height="300px" width="90%" id="tenantTop5" :data="tenantTop5" :setting="{ color: ['#2d8cf0', '#ff0000', '#ff0000', '#ff9900'] }"></bar-charts>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <div slot="header">用户消费TOP5</div>
            <bar-charts v-if="userTop5" theme="用户消费TOP5" ref="chart5" height="300px" width="90%" id="userTop5" :data="userTop5" :setting="{ color: ['#2d8cf0', '#ff0000', '#ff0000', '#ff9900'] }"> </bar-charts>
          </el-card>
        </el-col>
      </el-row>
    </el-row>
  </el-card>
</template>

<script>
import { getTenant } from 'services/system/tenant'
import { conditionBill } from 'services/services/bill'
import { formatDate } from './formatDate.js'

export default {
  data() {
    return {
      totalBills: 0,
      incomeTrend: '',
      productIncome: '',
      productTrend: '',
      tenantTop5: '',
      userTop5: ''
    }
  },
  created() {
    this.search()
  },
  methods: {
    search() {
      const start = formatDate(new Date().getTime() - 1000 * 60 * 60 * 24 * 365)
      this.getOrder('totalBills', 'totalBills')
      this.getOrder('incomeTrend', 'incomeTrend', start)
      this.getOrder('productIncome', 'productIncome')
      this.getOrder('productTrend', 'productTrend', start)
      this.getOrder('tenantTop5', 'tenantTop5')
      this.getOrder('userTop5', 'userTop5')
    },
    getOrder(condition, list, start) {
      const obj = {
        condition: condition,
        start: start || '2019-05-31 12:00:00',
        end: formatDate(new Date().getTime())
      }
      conditionBill({
        condition: JSON.stringify(obj)
      }).then((data) => {
        if (data.success) {
          this[list] = data.data
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
