<template>
  <div class="wrapper" v-loading="loading">
    <el-card>
      <el-form inline>
        <el-form-item>
          <TimeSelect :get-data="getAllData"></TimeSelect>
        </el-form-item>
        <el-form-item>
          <el-select v-model="params.vendorId" clearable placeholder="平台类型">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in vendorList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" @click="getAllData" icon="el-icon-search">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="m-t-xs">
      <el-row :gutter="10">
        <el-col :span="7" :offset="2">
          <pie-charts ref="alarmPie" v-if="alarmPieChartData" id="alarmPie" :data="alarmPieChartData" :setting="setting2" width="100%" height="200px" theme="资源告警统计"></pie-charts>
        </el-col>
        <el-col :span="14">
          <bar-charts ref="chart2" height="250px" width="100%" id="cpu" :data="chart2Data" :setting="setting2" v-if="chart2Data"></bar-charts>
        </el-col>
      </el-row>
    </el-card>
    <el-card class="m-t-xs">
      <div slot="header" class="clearfix">
        <span>平台告警统计</span>
      </div>
      <div>
        <bar-charts ref="chart1" height="250px" width="100%" id="vendorChart" :data="vendorChart" :setting="setting2" v-if="vendorChart"></bar-charts>
      </div>
    </el-card>
    <el-card class="m-t">
      <div slot="header">告警报表</div>
      <basic-table :data="listData" :params="params.paging" :get-list="getList" :total="total">
        <el-table-column label="告警名称" show-overflow-tooltip prop="name"> </el-table-column>
        <el-table-column label="告警级别" show-overflow-tooltip>
          <template slot-scope="scope">
            <level-icon :color="scope.row.level | alarmLevelColor">
              {{ scope.row.level | alarmLevel }}
            </level-icon>
          </template>
        </el-table-column>
        <el-table-column label="告警源" show-overflow-tooltip prop="targetName"></el-table-column>
        <el-table-column label="资源类型" show-overflow-tooltip prop="type">
          <template slot-scope="scope">
            {{ scope.row.type | resourceTypeMonitor }}<span v-if="scope.row.type == 'VM'">({{ scope.row.osCategory }})</span>
          </template>
        </el-table-column>
        <el-table-column label="告警状态" show-overflow-tooltip>
          <template slot-scope="scope"> {{ scope.row.confirmed ? '已确认' : '未确认' }}，{{ scope.row.solved ? '已清除' : '未清除' }} </template>
        </el-table-column>
        <el-table-column label="告警内容" show-overflow-tooltip prop="remark"></el-table-column>
        <el-table-column label="告警恢复值" show-overflow-tooltip prop="recoveryVal"></el-table-column>
        <el-table-column label="告警触发时间" show-overflow-tooltip prop="gmtTrigger"></el-table-column>
        <el-table-column label="已持续时长" show-overflow-tooltip prop="duration"></el-table-column>
        <el-table-column label="确认人" show-overflow-tooltip prop="confirmer"></el-table-column>
        <el-table-column label="确认时间" show-overflow-tooltip prop="gmtConfirm"></el-table-column>
      </basic-table>
    </el-card>
  </div>
</template>
<script>
import { getCloudVendor, getVdc, getCluters } from 'services/platform/index'
import { getResourceChart, exportReport, getComputeReport } from 'services/report/resource'
import { getAlarmPieChart, getVendorChart, getAlarmBarChart, getAlarmList } from 'services/monitor/index.js'

const setting2 = {
  color: ['#EC1C24', '#FF7F27', '#FFF200', '#4EAFF5']
}
export default {
  data() {
    return {
      loading: false,
      vendorList: [],
      vdcList: [],
      clusterList: [],
      compouteTrend: '',
      alarmPieChartData: '',
      vendorChart: '',
      chart2Data: '',
      setting2,
      listData: [],
      total: 0,
      params: {
        time: 'Months',
        paging: {
          rows: 5,
          page: 1
        }
      }
    }
  },
  created() {
    this.getVendorList()
    this.getAllData()
  },
  methods: {
    getAllData(data) {
      this.params.paging.page = 1
      this.getList()
      this.getAlarmPieData()
      this.getVendorBarChart()
      this.getBarData(data)
    },
    getVendorList() {
      this.params.vendorId = ''
      getCloudVendor({
        page: 1,
        rows: 9999
      }).then((data) => {
        if (data.success) {
          this.vendorList = data.data.rows
        }
      })
    },
    async getList(item) {
      const data = await getAlarmList({
        page: this.params.paging.page,
        rows: this.params.paging.rows,
        params: this.$tools.handleSearchParam({
          vendorId: this.params.vendorId || '',
          status: 'SOLVED',
          eventAlarm: 0
        })
      })
      if (data.success) {
        this.listData = data.data.rows
        this.total = data.data.total
      }
    },
    getAlarmPieData() {
      getAlarmPieChart({}).then((data) => {
        if (data.success) {
          this.alarmPieChartData = data.data
        }
      })
    },
    getVendorBarChart() {
      getVendorChart().then((data) => {
        if (data.success) {
          this.vendorChart = data.data
        }
      })
    },
    getBarData(params = {}) {
      this.params = {
        ...this.params,
        ...params
      }
      getResourceChart({
        ...this.params,
        category: 'dailyAlarm'
      }).then((data) => {
        if (data.success) {
          this.chart2Data = data.data
          console.log(this.chart2Data)
        }
      })
    }
  }
}
</script>
<style scoped lang="scss">
.right-border {
  border-right: 1px solid #000;
}
</style>
