<template>
  <el-card>
    <el-row :gutter="10">
      <el-form :inline="true">
        <div style="display: flex; justify-content: space-between">
          <el-select class="w-lg" v-model="tenantId" placeholder="请选择租户" clearable @change="handleTenantChange">
            <el-option v-for="item in tenantList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
          <el-button type="text" @click="handleCheckType">切换至{{ type === 'outside' ? '内部' : '外部' }}账单统计</el-button>
        </div>
        <!-- <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="search">搜索</el-button>
        </el-form-item> -->
      </el-form>
      <el-row :gutter="5" class="m-t-xs">
        <el-col :span="8">
          <el-card>
            <div slot="header">总费用</div>
            <div style="line-height: 100px; text-align: center; height: 120px">
              <span style="font-size: 24px">{{ totalMoney && totalMoney.totalMoney }}</span
              >元
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <div slot="header">本月消费</div>
            <div style="line-height: 95px; text-align: center; height: 120px">
              <span style="font-size: 24px">{{ totalMoney && totalMoney.monthMoney }}</span
              >元
              <div style="display: flex; justify-content: space-between; padding: 0 10px; line-height: 30px">
                <span>环比 {{ totalMoney && totalMoney.monthRatio }}%</span>
                <span>同比 {{ totalMoney && totalMoney.monthBasis }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <div slot="header">本季度费用</div>
            <div style="line-height: 95px; text-align: center; height: 120px">
              <span style="font-size: 24px">{{ totalMoney && totalMoney.quarterMoney }}</span
              >元
              <div style="display: flex; justify-content: space-between; padding: 0 10px; line-height: 30px">
                <span>环比 {{ totalMoney && totalMoney.quarterRatio }}%</span>
                <span>同比 {{ totalMoney && totalMoney.quarterBasis }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="5" class="m-t-xs">
        <el-col :span="12">
          <rich-charts :title="'近半年费用变化趋势(单位：元)'" :defaultChart="'line-charts'" :data="incomeTrend" height="260px" width="100%" v-if="incomeTrend"> </rich-charts>
        </el-col>
        <el-col :span="12">
          <rich-charts :title="'产品费用统计(单位：元)'" :defaultChart="'bar-charts'" :data="productIncome" height="260px" width="100%" v-if="productIncome"> </rich-charts>
        </el-col>
      </el-row>
      <el-row :gutter="5" class="m-t-xs">
        <el-col :span="12">
          <el-card>
            <div slot="header">租户消费TOP5</div>
            <bar-charts v-if="tenantTop5" theme="租户消费TOP5:" ref="chart4" height="300px" width="90%" id="tenantTop5" :data="tenantTop5"></bar-charts>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <div slot="header">{{ $store.getters.systemConfig.projectConfigLabel }}费用TOP10</div>
            <bar-reverse-charts :data="projectTop10" unit="%" v-if="projectTop10"></bar-reverse-charts>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="5" class="m-t-xs">
        <el-col :span="24">
          <el-card>
            <div slot="header">{{ $store.getters.systemConfig.projectConfigLabel }}费用分摊增长情况（单位：元）</div>
            <div>
              <el-select class="w-lg" filterable:placeholder="'请选择' + $store.getters.systemConfig.projectConfigLabel" v-model="projectId" clearable @change="handleChangeProject">
                <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
              <el-radio-group size="mini" v-model="timeType" class="pull-right" style="margin-top: -4px" @change="getProjectAllocation">
                <el-radio-button label="Day">天</el-radio-button>
                <el-radio-button label="Week">周</el-radio-button>
                <el-radio-button label="Month">月</el-radio-button>
                <el-radio-button label="Quarter">季度</el-radio-button>
                <el-radio-button label="HalfYear">半年</el-radio-button>
                <el-radio-button label="Year">一年</el-radio-button>
              </el-radio-group>
            </div>
            <line-charts v-if="projectAllocation" ref="chart2" height="220px" width="100%" id="projectAllocation" :data="projectAllocation"></line-charts>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="5" class="m-t-xs">
        <el-col :span="24">
          <el-card>
            <div slot="header">
              <span>费用明细（单位：元）</span>
              <el-radio-group size="mini" v-model="radioType" class="pull-right" style="margin-top: -4px" @change="getBill">
                <el-radio-button label="tenant" v-if="type === 'inside'">租户</el-radio-button>
                <el-radio-button label="service">产品</el-radio-button>
                <el-radio-button label="project" v-if="type === 'inside'">{{ $store.getters.systemConfig.projectConfigLabel }}</el-radio-button>
              </el-radio-group>
            </div>
            <div style="margin-bottom: 10px">
              <el-button type="primary" @click="handleExportView">导出</el-button>
            </div>
            <basic-table :data="billList" :params="billParams" :get-list="getBillList" :total="billTotal">
              <el-table-column label="租户名称" prop="" v-if="radioType === 'tenant'">
                <template slot-scope="scope">
                  <el-button type="text" @click="getDetail(scope.row, 'tenantList')"> {{ scope.row.tenantName }}</el-button>
                </template>
              </el-table-column>
              <el-table-column label="产品名称" prop="serviceName" v-if="radioType === 'service'"></el-table-column>
              <el-table-column :label="$store.getters.systemConfig.projectConfigLabel + '名称'" prop="projectName" v-if="radioType === 'project'">
                <template slot-scope="scope">
                  <el-button type="text" @click="getDetail(scope.row, 'projectList')"> {{ scope.row.projectName }}</el-button>
                </template>
              </el-table-column>
              <el-table-column label="总费用（元）" prop="totalMoney"></el-table-column>
              <el-table-column label="本月费用（元）" prop="monthMoney"></el-table-column>
              <el-table-column label="月费用环比" prop="monthRatio"></el-table-column>
              <el-table-column label="月费用同比" prop="monthBasis"></el-table-column>
              <el-table-column label="本季度费用（元）" prop="quarterMoney"></el-table-column>
              <el-table-column label="季度费用环比" prop="quarterRatio"></el-table-column>
              <el-table-column label="季度费用同比" prop="quarterBasis"></el-table-column>
            </basic-table>
          </el-card>
        </el-col>
      </el-row>
    </el-row>
    <detailEcharts :dialog="detailEchartsDialog" v-if="detailEchartsDialog.visible"></detailEcharts>
  </el-card>
</template>

<script>
import { getTenant } from 'services/system/tenant'
import { getCostOverview, getCostOverviewList, exportviewList } from 'services/services/bill'
import { formatDate } from './formatDate.js'
import detailEcharts from './detailEcharts.vue'
import { getProject } from 'services/system/project'

export default {
  components: { detailEcharts },
  data() {
    return {
      totalBills: 0,
      productTrend: '',
      userTop5: '',
      tenantId: null,
      tenantList: [],
      timeType: 'Year',
      radioType: 'tenant',
      billParams: {
        page: 1,
        rows: 10,
        condition: { condition: '' }
      },
      billTotal: 0,
      detailEchartsDialog: {
        visible: false,
        data: {}
      },
      totalMoney: null,
      incomeTrend: null,
      productIncome: null,
      tenantTop5: null,
      projectTop10: null,
      projectAllocation: null,
      type: 'inside',
      projectList: [],
      billList: [],
      projectId: null
    }
  },
  created() {
    this.getTenant()
    this.getProjectList()
    this.search()
    this.getBillList()
  },
  methods: {
    search() {
      this.getOrder('totalMoney', this.type, this.tenantId)
      this.getOrder('incomeTrend', this.type, this.tenantId)
      this.getOrder('productIncome', this.type, this.tenantId)
      this.getOrder('tenantTop5')
      this.getOrder('projectTop10', null, this.tenantId)
      this.getOrder('projectAllocation', this.type, this.tenantId, this.projectId, this.timeType, this.start, this.end)
    },
    getOrder(condition, type, tenantId, projectId, time, start, end) {
      const obj = {
        condition: condition,
        type: type,
        tenantId: tenantId,
        projectId: projectId,
        time,
        start,
        end
      }
      getCostOverview({
        condition: JSON.stringify(obj)
      }).then((data) => {
        if (data.success) {
          this[condition] = data.data
        }
      })
    },
    // 获取费用明细
    getBillList() {
      this.billParams.condition = JSON.stringify({ condition: this.radioType, type: this.type })
      getCostOverviewList(this.billParams).then((res) => {
        if (res.success) {
          this.billList = res.data.rows
          this.billTotal = res.data.total
        }
      })
    },
    getTenant() {
      const params = {
        page: 1,
        size: 9999,
        simple: true
      }
      getTenant(params).then((res) => {
        if (res.success) {
          this.tenantList = res.data.rows
        }
      })
    },
    getBill() {
      this.billList = []
      this.billTotal = 0
      this.getBillList()
    },
    getDetail(row, type) {
      console.log(row, '....row')
      this.detailEchartsDialog.visible = true
      this.detailEchartsDialog.orderType = type
      this.detailEchartsDialog.data = {
        ...row,
        timeType: this.timeType,
        type: this.type,
        start: this.start,
        end: this.end,
        radioType: this.radioType
      }
    },
    handleCheckType() {
      if (this.type === 'inside') {
        this.type = 'outside'
        this.radioType = 'service'
      } else if (this.type === 'outside') {
        this.type = 'inside'
        this.radioType = 'tenant'
      }
      this.search()
      this.getBillList()
    },
    getProjectAllocation() {
      this.getOrder('projectAllocation', this.type, this.tenantId, this.projectId, this.timeType, this.start, this.end)
    },
    // 获取应用系统
    getProjectList() {
      const params = {
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { tenantId: this.tenantId === '' ? null : this.tenantId }, sign: 'EQ' }]),
        simple: true
      }
      getProject(params).then((res) => {
        this.projectList = res.data.rows
      })
    },
    handleTenantChange() {
      if (this.tenantId === '') {
        this.tenantId = null
      }
      this.projectList = []
      this.projectId = null
      this.getProjectList()
      this.search()
      this.getBillList()
    },
    handleChangeProject() {
      if (this.projectId === '') {
        this.projectId = null
      }
      this.getOrder('projectAllocation', this.type, this.tenantId, this.projectId, this.timeType, this.start, this.end)
    },
    handleExportView() {
      exportviewList(this.billParams)
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
