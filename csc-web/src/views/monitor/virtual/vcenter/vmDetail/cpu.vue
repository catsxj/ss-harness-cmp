<template>
  <div>
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
import userDefind from '../../userDefind.vue'
import { getCharts } from 'services/monitor'
const intervalData = [
  { name: '1H', value: '1H' },
  { name: '6H', value: '6H' },
  { name: '1D', value: '1D' },
  { name: '7D', value: '7D' },
  { name: '14D', value: '14D' }
]
const typeData = [{ name: 'CPU利用率', value: 'usage' }]
export default {
  components: { userDefind },
  props: {
    detailId: {
      type: Number
    },
    identifier: {
      type: String
    },
    hostName: {
      type: String
    }
  },
  data() {
    return {
      intervalData,
      typeData,
      dashboradData: {
        usage: null
      },
      cpu: {
        usage: {}
      },
      chartType: '',
      userDefindVisible: false,
      userDefindTime: [],
      usageDefindTime: [],
      usageTimeInterval: ''
    }
  },
  beforeDestroy() {
    clearInterval(this.usageTimeInterval)
  },
  methods: {
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
      }
    },
    getUsageChart() {
      const str1 = 'round(vsphere_vm_cpu_usage_average{cpu="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"},0.01)'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.cpu.usage.stepValue,
        start: this.cpu.usage.start,
        end: this.cpu.usage.end,
        expr: expr,
        name: '["cpu利用率"]',
        unit: '%'
      }).then(data => {
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
        }
      }
    },
    userDefind(type) {
      this.chartType = type
      switch (type) {
        case 'usage':
          this.userDefindTime = this.usageDefindTime
          break
      }
      this.userDefindVisible = true
    }
  },
  created() {
    this.changeInterval('1H', 'usage')
  }
}
</script>
