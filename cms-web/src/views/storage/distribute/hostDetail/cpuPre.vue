<template>
  <div>
    <detail-map :detail="detailData" :list="detailMapList"></detail-map>
    <el-row :gutter="20">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <el-card class="box-card m-t">
          <div slot="header" class="clearfix">
            <span>
              {{ chart.name }}
            </span>
            <span class="pull-right">
              <el-button-group>
                <el-button size="mini" :type="item.value == cpu[chart.value].step ? 'primary' : ''" v-for="item in intervalData" :key="item.value" @click="changeInterval(item.value, chart.value)">{{ item.name }}</el-button>
                <el-button size="mini" :type="cpu[chart.value].step === 0 ? 'primary' : ''" @click="userDefind(chart.value)">自定义</el-button>
              </el-button-group>
            </span>
          </div>
          <div>
            <line-charts height="220px" width="100%" :id="chart.value + 'Cpu'" :data="dashboradData[chart.value]" :unit="dashboradData[chart.value].unit" v-if="dashboradData[chart.value]"></line-charts>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <user-defind v-if="userDefindVisible" :user-defind-visible="userDefindVisible" :user-defind-time="userDefindTime" @getData="getOverviewChart"></user-defind>
  </div>
</template>
<script>
import userDefind from './userDefind.vue'
import detailMap from '../detailMap'
import { getCharts, getHostCpu } from 'services/monitor'
const intervalData = [
  { name: '1H', value: '1H' },
  { name: '6H', value: '6H' },
  { name: '1D', value: '1D' },
  { name: '7D', value: '7D' },
  { name: '14D', value: '14D' }
]
const typeData = [
  { name: 'CPU利用率', value: 'usage' },
  { name: 'cpu内核利用率', value: 'core' },
  { name: 'cpu等待总时间', value: 'wait' },
  { name: 'cpu闲置时间', value: 'idle' }
]
export default {
  components: { userDefind, detailMap },
  props: {
    detailId: {
      type: Number
    },
    managerIp: {
      type: String
    }
  },
  data() {
    return {
      intervalData,
      typeData,
      detailData: {},
      detailMapList: [
        { name: 'CPU类型', value: 'cpuModel', unit: '' },
        { name: 'CPU数量', value: 'cpuAmount', unit: '' },
        { name: 'CPU核数', value: 'cpuCore', unit: '' },
        { name: 'CPU总量', value: 'cpuTotal', unit: 'MHZ' },
        { name: 'CPU使用量', value: 'cpuUsed', unit: 'MHZ' },
        { name: 'CPU空闲量', value: 'cpuFree', unit: 'MHZ' }
      ],
      dashboradData: {
        usage: null,
        core: null,
        wait: null,
        idle: null
      },
      cpu: {
        usage: {},
        core: {},
        wait: {},
        idle: {}
      },
      chartType: '',
      userDefindVisible: false,
      userDefindTime: [],
      usageDefindTime: [],
      coreDefindTime: [],
      waitDefindTime: [],
      idleDefindTime: [],
      usageTimeInterval: '',
      coreTimeInterval: '',
      waitTimeInterval: '',
      idleTimeInterval: ''
    }
  },
  beforeDestroy() {
    clearInterval(this.coreTimeInterval)
    clearInterval(this.waitTimeInterval)
    clearInterval(this.usageTimeInterval)
    clearInterval(this.idleTimeInterval)
  },
  methods: {
    getCpu() {
      getHostCpu(this.detailId).then((data) => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
        }
      })
    },
    computeInterval(type, value, callback) {
      this.cpu[type].end = Math.round(new Date().getTime() / 1000)
      switch (value) {
        case '1H':
          this.cpu[type].start = this.cpu[type].end - 3600
          break
        case '6H':
          this.cpu[type].start = this.cpu[type].end - 6 * 3600
          break
        case '1D':
          this.cpu[type].start = this.cpu[type].end - 24 * 3600
          break
        case '7D':
          this.cpu[type].start = this.cpu[type].end - 7 * 24 * 3600
          break
        case '14D':
          this.cpu[type].start = this.cpu[type].end - 14 * 24 * 3600
          break
        default:
          break
      }
      if (value) {
        const duration = this.cpu[type].end - this.cpu[type].start
        this.cpu[type].stepValue = duration / 180 - ((duration / 180) % 20)
        callback()
      }
    },
    // 改变申请概览周期
    changeInterval(value, type) {
      this.chartType = type
      this.cpu[type].step = value
      switch (type) {
        case 'usage':
          this.computeInterval(type, value, this.getUsageChart)
          break
        case 'core':
          this.computeInterval(type, value, this.getCoreChart)
          break
        case 'wait':
          this.computeInterval(type, value, this.getWaitChart)
          break
        case 'idle':
          this.computeInterval(type, value, this.getIdleChart)
          break
      }
    },
    getUsageChart() {
      const str1 = 'round(vsphere_host_cpu_usage_average{cpu="instance-total",esxhostname="' + this.managerIp + '"}, 0.01)'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.cpu.usage.stepValue,
        start: this.cpu.usage.start,
        end: this.cpu.usage.end,
        expr: expr,
        name: '["cpu利用率"]',
        unit: '%'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.usage = Object.assign({}, data.data)
          if (this.usageTimeInterval) {
            clearInterval(this.usageTimeInterval)
            this.usageTimeInterval = ''
          }
          if (this.cpu.usage.step != 0) {
            this.usageTimeInterval = setInterval(() => {
              this.computeInterval('usage', this.cpu.usage.step, this.getUsageChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getCoreChart() {
      const str1 = 'vsphere_host_cpu_coreUtilization_average{cpu="instance-total",esxhostname="' + this.managerIp + '"}'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.cpu.core.stepValue,
        start: this.cpu.core.start,
        end: this.cpu.core.end,
        expr: expr,
        name: '["cpu内核利用率"]',
        unit: '%'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.core = Object.assign({}, data.data)
          if (this.coreTimeInterval) {
            clearInterval(this.coreTimeInterval)
            this.coreTimeInterval = ''
          }
          if (this.cpu.core.step != 0) {
            this.coreTimeInterval = setInterval(() => {
              this.computeInterval('core', this.cpu.core.step, this.getCoreChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getWaitChart() {
      const str1 = '1/1000*vsphere_host_cpu_wait_summation{esxhostname="' + this.managerIp + '"}'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.cpu.wait.stepValue,
        start: this.cpu.wait.start,
        end: this.cpu.wait.end,
        expr: expr,
        name: '["cpu等待总时间"]',
        unit: 's'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.wait = Object.assign({}, data.data)
          if (this.waitTimeInterval) {
            clearInterval(this.waitTimeInterval)
            this.waitTimeInterval = ''
          }
          if (this.cpu.wait.step != 0) {
            this.waitTimeInterval = setInterval(() => {
              this.computeInterval('wait', this.cpu.wait.step, this.getWaitChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getIdleChart() {
      const str1 = '1/1000*vsphere_host_cpu_idle_summation{cpu="instance-total",esxhostname="' + this.managerIp + '"}'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.cpu.idle.stepValue,
        start: this.cpu.idle.start,
        end: this.cpu.idle.end,
        expr: expr,
        name: '["cpu闲置时间"]',
        unit: 's'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.idle = Object.assign({}, data.data)
          if (this.idleTimeInterval) {
            clearInterval(this.idleTimeInterval)
            this.idleTimeInterval = ''
          }
          if (this.cpu.idle.step != 0) {
            this.idleTimeInterval = setInterval(() => {
              this.computeInterval('idle', this.cpu.idle.step, this.getIdleChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getOverviewChart(value) {
      this.userDefindVisible = false
      if (value) {
        this.cpu[this.chartType].step = 0
        this.cpu[this.chartType].start = Math.round(value[0] / 1000)
        this.cpu[this.chartType].end = Math.round(value[1] / 1000)
        const duration = this.cpu[this.chartType].end - this.cpu[this.chartType].start
        this.cpu[this.chartType].stepValue = duration / 180 - ((duration / 180) % 20)
        switch (this.chartType) {
          case 'usage':
            this.usageDefindTime = value
            this.getUsageChart()
            break
          case 'core':
            this.coreDefindTime = value
            this.getCoreChart()
            break
          case 'wait':
            this.waitDefindTime = value
            this.getWaitChart()
            break
          case 'idle':
            this.idleDefindTime = value
            this.getIdleChart()
            break
        }
      }
    },
    userDefind(type) {
      this.chartType = type
      switch (type) {
        case 'usage':
          this.userDefindTime = this.usageDefindTime
          break
        case 'core':
          this.userDefindTime = this.coreDefindTime
          break
        case 'wait':
          this.userDefindTime = this.waitDefindTime
          break
        case 'idle':
          this.userDefindTime = this.idleDefindTime
          break
      }
      this.userDefindVisible = true
    }
  },
  created() {
    this.getCpu()
    this.changeInterval('1H', 'usage')
    this.changeInterval('1H', 'core')
    this.changeInterval('1H', 'wait')
    this.changeInterval('1H', 'idle')
  }
}
</script>
