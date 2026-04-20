<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="24" v-for="chart in typeData" :key="chart.value">
        <el-card class="box-card m-t">
          <div slot="header" class="clearfix">
            <span>
              {{ chart.name }}
            </span>
            <span class="pull-right">
              <el-button-group>
                <el-button size="mini" :type="item.value == container[chart.value].step ? 'primary' : ''" v-for="item in intervalData" :key="item.value" @click="changeInterval(item.value, chart.value)">{{ item.name }}</el-button>
                <el-button size="mini" :type="container[chart.value].step === 0 ? 'primary' : ''" @click="userDefind(chart.value)">自定义</el-button>
              </el-button-group>
            </span>
          </div>
          <div>
            <line-charts height="220px" width="100%" :id="chart.value + 'Container'" :data="dashboradData[chart.value]" :unit="dashboradData[chart.value].unit" v-if="dashboradData[chart.value]"></line-charts>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <user-defind v-if="userDefindVisible" :user-defind-visible="userDefindVisible" :user-defind-time="userDefindTime" @getData="getOverviewChart"></user-defind>
  </div>
</template>
<script>
import userDefind from 'views/monitor/components/userDefind.vue'
import { getCharts } from 'services/monitor'
const intervalData = [
  { name: '1H', value: '1H' },
  { name: '6H', value: '6H' },
  { name: '1D', value: '1D' },
  { name: '7D', value: '7D' },
  { name: '14D', value: '14D' }
]
const typeData = [{ name: '内存利用率', value: 'memory' }]
export default {
  components: { userDefind },
  props: {
    detailId: {
      type: String
    }
  },
  data() {
    return {
      intervalData,
      typeData,
      dashboradData: {
        memory: null
      },
      container: {
        memory: {}
      },
      chartType: '',
      userDefindVisible: false,
      userDefindTime: [],
      memoryDefindTime: [],
      memoryInterval: ''
    }
  },
  beforeDestroy() {
    clearInterval(this.memoryInterval)
  },
  methods: {
    computeInterval(type, value, callback) {
      this.container[type].end = Math.round(new Date().getTime() / 1000)
      switch (value) {
        case '1H':
          this.container[type].start = this.container[type].end - 3600
          break
        case '6H':
          this.container[type].start = this.container[type].end - 6 * 3600
          break
        case '1D':
          this.container[type].start = this.container[type].end - 24 * 3600
          break
        case '7D':
          this.container[type].start = this.container[type].end - 7 * 24 * 3600
          break
        case '14D':
          this.container[type].start = this.container[type].end - 14 * 24 * 3600
          break
        default:
          break
      }
      if (value) {
        const duration = this.container[type].end - this.container[type].start
        this.container[type].stepValue = duration / 180 - ((duration / 180) % 20)
        callback()
      }
    },
    // 改变申请概览周期
    changeInterval(value, type) {
      this.chartType = type
      this.container[type].step = value
      switch (type) {
        case 'memory':
          this.computeInterval(type, value, this.getMemoryChart)
          break
      }
    },
    getMemoryChart() {
      const str1 = ' bocloud_fusioncloud_vm_memoryUsage{id="' + this.detailId + '"}'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.container.memory.stepValue,
        start: this.container.memory.start,
        end: this.container.memory.end,
        expr: expr,
        name: '["内存利用率"]',
        unit: '%'
      }).then(data => {
        if (data.success) {
          this.dashboradData.memory = Object.assign({}, data.data)
          if (this.memoryInterval) {
            clearInterval(this.memoryInterval)
            this.memoryInterval = ''
          }
          if (this.container.memory.step != 0) {
            this.memoryInterval = setInterval(() => {
              this.computeInterval('memory', this.container.memory.step, this.getMemoryChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getOverviewChart(value) {
      this.userDefindVisible = false
      if (value) {
        this.container[this.chartType].step = 0
        this.container[this.chartType].start = Math.round(value[0] / 1000)
        this.container[this.chartType].end = Math.round(value[1] / 1000)
        const duration = this.container[this.chartType].end - this.container[this.chartType].start
        this.container[this.chartType].stepValue = duration / 180 - ((duration / 180) % 20)
        switch (this.chartType) {
          case 'memory':
            this.memoryDefindTime = value
            this.getMemoryChart()
            break
        }
      }
    },
    userDefind(type) {
      this.chartType = type
      switch (type) {
        case 'memory':
          this.userDefindTime = this.memoryDefindTime
          break
      }
      this.userDefindVisible = true
    }
  },
  created() {
    this.changeInterval('1H', 'memory')
  }
}
</script>
<style></style>
