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
                <el-button size="mini" :type="item.value == mem[chart.value].step ? 'primary' : ''" v-for="item in intervalData" :key="item.value" @click="changeInterval(item.value, chart.value)">{{ item.name }}</el-button>
                <el-button size="mini" :type="mem[chart.value].step === 0 ? 'primary' : ''" @click="userDefind(chart.value)">自定义</el-button>
              </el-button-group>
            </span>
          </div>
          <div>
            <line-charts height="220px" width="100%" :id="chart.value + 'Mem'" :data="dashboradData[chart.value]" :unit="dashboradData[chart.value].unit" v-if="dashboradData[chart.value]"></line-charts>
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
const typeData = [{ name: '内存利用率', value: 'usage' }]
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
      mem: {
        usage: {}
      },
      chartType: '',
      userDefindVisible: false,
      userDefindTime: [],
      usageDefindTime: [],
      usageTimeInterval: ''
    }
  },
  methods: {
    computeInterval(type, value, callback) {
      this.mem[type].end = Math.round(new Date().getTime() / 1000)
      switch (value) {
        case '1H':
          this.mem[type].start = this.mem[type].end - 3600
          break
        case '6H':
          this.mem[type].start = this.mem[type].end - 6 * 3600
          break
        case '1D':
          this.mem[type].start = this.mem[type].end - 24 * 3600
          break
        case '7D':
          this.mem[type].start = this.mem[type].end - 7 * 24 * 3600
          break
        case '14D':
          this.mem[type].start = this.mem[type].end - 14 * 24 * 3600
          break
        default:
          break
      }
      if (value) {
        const duration = this.mem[type].end - this.mem[type].start
        this.mem[type].stepValue = duration / 180 - ((duration / 180) % 20)
        callback()
      }
    },
    // 改变申请概览周期
    changeInterval(value, type) {
      this.chartType = type
      this.mem[type].step = value
      switch (type) {
        case 'usage':
          this.computeInterval(type, value, this.getUsageMemChart)
          break
      }
    },
    getUsageMemChart() {
      const str1 = 'round(vsphere_vm_mem_usage_average{vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"},0.01)'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.mem.usage.stepValue,
        start: this.mem.usage.start,
        end: this.mem.usage.end,
        expr: expr,
        name: '["内存利用率"]',
        unit: '%'
      }).then(data => {
        if (data.success) {
          this.dashboradData.usage = Object.assign({}, data.data)
          if (this.usageTimeInterval) {
            clearInterval(this.usageTimeInterval)
            this.usageTimeInterval = ''
          }
          if (this.mem.usage.step != 0) {
            this.usageTimeInterval = setInterval(() => {
              this.computeInterval('usage', this.mem.usage.step, this.getUsageMemChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getOverviewChart(value) {
      this.userDefindVisible = false
      if (value) {
        this.mem[this.chartType].step = 0
        this.mem[this.chartType].start = Math.round(value[0] / 1000)
        this.mem[this.chartType].end = Math.round(value[1] / 1000)
        const duration = this.mem[this.chartType].end - this.mem[this.chartType].start
        this.mem[this.chartType].stepValue = duration / 180 - ((duration / 180) % 20)
        switch (this.chartType) {
          case 'usage':
            this.usageDefindTime = value
            this.getUsageMemChart()
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
  },
  beforeDestroy() {
    clearInterval(this.usageTimeInterval)
  }
}
</script>
