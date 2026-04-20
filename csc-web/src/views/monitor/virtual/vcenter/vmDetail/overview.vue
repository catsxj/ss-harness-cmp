<template>
  <div>
    <detail-map :detail="detailData" :list="detailMapList" v-if="isShow"></detail-map>
    <el-row :gutter="20">
      <el-col :span="24">
        <el-col :span="12">
          <el-card class="box-card m-t">
            <div slot="header" class="clearfix">
              <span>使用情况</span>
            </div>
            <div class="text-center">
              <el-row :gutter="20">
                <el-col :span="12">
                  <div>CPU利用率</div>
                  <gauge-charts v-if="dashboardData.cpuUsage1" height="200px" id="cpuUsage" width="100%" :data="dashboardData.cpuUsage1"></gauge-charts>
                </el-col>
                <el-col :span="12">
                  <div>内存利用率</div>
                  <gauge-charts v-if="dashboardData.memUsage1" height="200px" id="memUsage" width="100%" :data="dashboardData.memUsage1"></gauge-charts>
                </el-col>
              </el-row>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="box-card m-t">
            <div slot="header" class="clearfix">
              <span>CPU利用率</span>
              <span class="pull-right">
                <el-button-group>
                  <el-button size="mini" :type="item.value == paramsOverviewChart.cpu.step ? 'primary' : ''" v-for="item in intervalData" :key="item.value" @click="changeInterval(item.value, 'cpu')">{{ item.name }}</el-button>
                  <el-button size="mini" :type="paramsOverviewChart.cpu.step === 0 ? 'primary' : ''" @click="userDefind('cpu')">自定义</el-button>
                </el-button-group>
              </span>
            </div>
            <div>
              <line-charts ref="cpuUsageChart" height="220px" width="100%" id="cpuUsageChart" :data="dashboradDataCpu" :unit="dashboradDataCpu.unit" v-if="dashboradDataCpu"></line-charts>
            </div>
          </el-card>
        </el-col>
      </el-col>
      <el-col :span="24">
        <el-col :span="12">
          <el-card class="box-card m-t">
            <div slot="header" class="clearfix">
              <span>磁盘使用速率</span>
              <span class="pull-right">
                <el-button-group>
                  <el-button size="mini" :type="item.value == paramsOverviewChart.disk.step ? 'primary' : ''" v-for="item in intervalData" :key="item.value" @click="changeInterval(item.value, 'disk')">{{ item.name }}</el-button>
                  <el-button size="mini" :type="paramsOverviewChart.disk.step === 0 ? 'primary' : ''" @click="userDefind('disk')">自定义</el-button>
                </el-button-group>
              </span>
            </div>
            <div>
              <line-charts ref="diskUsageChart" height="200px" width="100%" id="diskUsageChart" :data="dashboradDataDisk" :unit="dashboradDataDisk.unit" v-if="dashboradDataDisk"></line-charts>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="box-card m-t">
            <div slot="header" class="clearfix">
              <span>内存利用率</span>
              <span class="pull-right">
                <el-button-group>
                  <el-button size="mini" :type="item.value == paramsOverviewChart.mem.step ? 'primary' : ''" v-for="item in intervalData" :key="item.value" @click="changeInterval(item.value, 'mem')">{{ item.name }}</el-button>
                  <el-button size="mini" :type="paramsOverviewChart.mem.step === 0 ? 'primary' : ''" @click="userDefind('mem')">自定义</el-button>
                </el-button-group>
              </span>
            </div>
            <div>
              <line-charts ref="memUsageChart" height="200px" width="100%" id="memUsageChart" :data="dashboradDataMem" :unit="dashboradDataMem.unit" v-if="dashboradDataMem"></line-charts>
            </div>
          </el-card>
        </el-col>
      </el-col>
    </el-row>
    <user-defind v-if="userDefindVisible" :user-defind-visible="userDefindVisible" :user-defind-time="userDefindTime" @getData="getOverviewChart"></user-defind>
  </div>
</template>
<script>
import userDefind from '../../userDefind.vue'
import { getUsage, getCharts } from 'services/monitor'
import { detailVm } from 'services/platform/index'
import detailMap from 'views/monitor/components/detailMap.vue'
const intervalData = [
  { name: '1H', value: '1H' },
  { name: '6H', value: '6H' },
  { name: '1D', value: '1D' },
  { name: '7D', value: '7D' },
  { name: '14D', value: '14D' }
]
export default {
  components: {
    userDefind,
    detailMap
  },
  props: {
    detailId: {
      type: Number
    },
    identifier: {
      type: String
    },
    hostName: {
      type: String
    },
    isShow: {
      type: Boolean
    }
  },
  beforeDestroy() {
    clearInterval(this.timeIntervalCpu)
    clearInterval(this.timeIntervalDisk)
    clearInterval(this.timeIntervalMem)
    clearInterval(this.timeIntervalDashboard)
  },
  data() {
    return {
      detailMapList: [
        { name: 'IP', value: 'managerIp', unit: '' },
        { name: '规格', value: 'spec' },
        { name: '创建时间', value: 'gmtCreate', unit: '' },
        { name: '操作系统', value: 'osCategory' }
      ],
      intervalData,
      detailData: {},
      dashboardData: {},
      dashboradDataCpu: null,
      dashboradDataDisk: null,
      dashboradDataMem: null,
      paramsOverviewChart: {
        cpu: {
          step: '1H'
        },
        disk: {
          step: '1H'
        },
        mem: {
          step: '1H'
        }
      },
      userDefindTime: [],
      cpuDefindTime: [],
      diskDefindTime: [],
      memDefindTime: [],
      userDefindVisible: false,
      chartType: '',
      timeIntervalCpu: '',
      timeIntervalMem: '',
      timeIntervalDisk: '',
      timeIntervalDashboard: ''
    }
  },
  methods: {
    getDetail() {
      detailVm(this.detailId).then(data => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
          this.detailData.spec = (this.detailData.cpu ? this.detailData.cpu : 0) + 'C/' + (this.detailData.memory ? this.detailData.memory : 0) + 'GB/' + (this.detailData.disk == null ? 0 : this.detailData.disk) + 'GB'
        }
      })
    },
    getDashboard() {
      const expr1 = 'round(vsphere_vm_cpu_usage_average{cpu="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"},0.01)'
      const expr2 = 'round(vsphere_vm_mem_usage_average{vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"},0.01)'
      getUsage({
        expr: expr1,
        simple: true
      }).then(data => {
        if (data.success) {
          this.$set(this.dashboardData, 'cpuUsage1', {
            name: 'CPU利用率',
            data: { value: data.data, name: '%' },
            min: 0,
            max: 100
          })
        }
      })
      getUsage({
        expr: expr2,
        simple: true
      }).then(data => {
        if (data.success) {
          this.$set(this.dashboardData, 'memUsage1', {
            name: '内存利用率',
            data: { value: data.data, name: '%' },
            min: 0,
            max: 100
          })
        }
      })
      if (this.timeIntervalDashboard) {
        clearInterval(this.timeIntervalDashboard)
        this.timeIntervalDashboard = ''
      }
      this.timeIntervalDashboard = setInterval(() => {
        this.getDashboard()
      }, 60 * 1000)
    },
    computeInterval(type, value, callback) {
      this.paramsOverviewChart[type].end = Math.round(new Date().getTime() / 1000)
      switch (value) {
        case '1H':
          this.paramsOverviewChart[type].start = this.paramsOverviewChart[type].end - 3600
          break
        case '6H':
          this.paramsOverviewChart[type].start = this.paramsOverviewChart[type].end - 6 * 3600
          break
        case '1D':
          this.paramsOverviewChart[type].start = this.paramsOverviewChart[type].end - 24 * 3600
          break
        case '7D':
          this.paramsOverviewChart[type].start = this.paramsOverviewChart[type].end - 7 * 24 * 3600
          break
        case '14D':
          this.paramsOverviewChart[type].start = this.paramsOverviewChart[type].end - 14 * 24 * 3600
          break
        default:
          break
      }
      if (value) {
        const duration = this.paramsOverviewChart[type].end - this.paramsOverviewChart[type].start
        this.paramsOverviewChart[type].stepValue = duration / 180 - ((duration / 180) % 20)
        callback()
      }
    },
    // 改变申请概览周期
    changeInterval(value, type) {
      this.chartType = type
      this.paramsOverviewChart[type].step = value
      switch (type) {
        case 'cpu':
          this.computeInterval(type, value, this.getOverviewCpuChart)
          break
        case 'disk':
          this.computeInterval(type, value, this.getOverviewDiskChart)
          break
        case 'mem':
          this.computeInterval(type, value, this.getOverviewMemChart)
          break
      }
    },
    getOverviewChart(value) {
      this.userDefindVisible = false
      if (value) {
        this.paramsOverviewChart[this.chartType].step = 0
        this.paramsOverviewChart[this.chartType].start = Math.round(value[0] / 1000)
        this.paramsOverviewChart[this.chartType].end = Math.round(value[1] / 1000)
        const duration = this.paramsOverviewChart[this.chartType].end - this.paramsOverviewChart[this.chartType].start
        this.paramsOverviewChart[this.chartType].stepValue = duration / 180 - ((duration / 180) % 20)
        switch (this.chartType) {
          case 'cpu':
            this.cpuDefindTime = value
            this.getOverviewCpuChart()
            break
          case 'mem':
            this.memDefindTime = value
            this.getOverviewMemChart()
            break
          case 'disk':
            this.diskDefindTime = value
            this.getOverviewDiskChart()
            break
        }
      }
    },
    getOverviewCpuChart() {
      const str1 = 'round(vsphere_vm_cpu_usage_average{cpu="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"},0.01)'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.paramsOverviewChart.cpu.stepValue,
        start: this.paramsOverviewChart.cpu.start,
        end: this.paramsOverviewChart.cpu.end,
        expr: expr,
        name: '["cpu利用率"]',
        unit: '%'
      }).then(data => {
        if (data.success) {
          this.dashboradDataCpu = Object.assign({}, data.data)
          if (this.timeIntervalCpu) {
            clearInterval(this.timeIntervalCpu)
            this.timeIntervalCpu = ''
          }
          if (this.paramsOverviewChart.cpu.step != 0) {
            this.timeIntervalCpu = setInterval(() => {
              this.computeInterval('cpu', this.paramsOverviewChart.cpu.step, this.getOverviewCpuChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getOverviewDiskChart() {
      const str1 = 'round(vsphere_vm_disk_usage_average{disk="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"},0.01)'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.paramsOverviewChart.disk.stepValue,
        start: this.paramsOverviewChart.disk.start,
        end: this.paramsOverviewChart.disk.end,
        expr: expr,
        name: '["磁盘使用速率"]',
        unit: 'KB/s'
      }).then(data => {
        if (data.success) {
          this.dashboradDataDisk = Object.assign({}, data.data)
          if (this.timeIntervalDisk) {
            clearInterval(this.timeIntervalDisk)
            this.timeIntervalDisk = ''
          }
          if (this.paramsOverviewChart.disk.step != 0) {
            this.timeIntervalDisk = setInterval(() => {
              this.computeInterval('disk', this.paramsOverviewChart.disk.step, this.getOverviewDiskChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getOverviewMemChart() {
      const str1 = 'round(vsphere_vm_mem_usage_average{vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"},0.01)'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.paramsOverviewChart.mem.stepValue,
        start: this.paramsOverviewChart.mem.start,
        end: this.paramsOverviewChart.mem.end,
        expr: expr,
        name: '["内存利用率"]',
        unit: '%'
      }).then(data => {
        if (data.success) {
          this.dashboradDataMem = Object.assign({}, data.data)
          if (this.timeIntervalMem) {
            clearInterval(this.timeIntervalMem)
            this.timeIntervalMem = ''
          }
          if (this.paramsOverviewChart.mem.step != 0) {
            this.timeIntervalMem = setInterval(() => {
              this.computeInterval('mem', this.paramsOverviewChart.mem.step, this.getOverviewMemChart)
            }, 60 * 1000)
          }
        }
      })
    },
    userDefind(type) {
      this.chartType = type
      switch (type) {
        case 'cpu':
          this.userDefindTime = this.cpuDefindTime
          break
        case 'disk':
          this.userDefindTime = this.diskDefindTime
          break
        case 'mem':
          this.userDefindTime = this.memDefindTime
          break
      }
      this.userDefindVisible = true
    }
  },
  created() {
    this.getDetail()
    this.getDashboard()
    this.changeInterval('1H', 'cpu')
    this.changeInterval('1H', 'disk')
    this.changeInterval('1H', 'mem')
  }
}
</script>
