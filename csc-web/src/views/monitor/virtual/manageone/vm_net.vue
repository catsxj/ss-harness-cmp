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
const typeData = [
  { name: '网络速率', value: 'first' },
  { name: '网络平均带宽', value: 'third' },
  { name: '网络丢包百分比', value: 'fourth' }
]
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
        first: null,
        third: null,
        fourth: null
      },
      container: {
        first: {},
        third: {},
        fourth: {}
      },
      chartType: '',
      userDefindVisible: false,
      userDefindTime: [],
      firstDefindTime: [],
      thirdDefindTime: [],
      fourthDefindTime: [],
      firstInterval: '',
      thirdInterval: '',
      fourthInterval: ''
    }
  },
  beforeDestroy() {
    clearInterval(this.thirdInterval)
    clearInterval(this.firstInterval)
    clearInterval(this.fourthInterval)
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
        case 'first':
          this.computeInterval(type, value, this.getFirstChart)
          break
        case 'third':
          this.computeInterval(type, value, this.getThirdChart)
          break
        case 'fourth':
          this.computeInterval(type, value, this.getFourthChart)
          break
      }
    },
    getFirstChart() {
      const str1 = 'bocloud_fusioncloud_vm_nicByteIn{id="' + this.detailId + '"}'
      const str2 = 'bocloud_fusioncloud_vm_nicByteOut{id="' + this.detailId + '"}'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.container.first.stepValue,
        start: this.container.first.start,
        end: this.container.first.end,
        expr: expr,
        name: '["网络流入速率", "网络流出速率"]',
        unit: 'KB/s'
      }).then(data => {
        if (data.success) {
          this.dashboradData.first = Object.assign({}, data.data)
          if (this.firstInterval) {
            clearInterval(this.firstInterval)
            this.firstInterval = ''
          }
          if (this.container.first.step != 0) {
            this.firstInterval = setInterval(() => {
              this.computeInterval('first', this.container.first.step, this.getFirstChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getThirdChart() {
      const str1 = 'bocloud_fusioncloud_vm_nicByteInOut{id="' + this.detailId + '"}'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.container.third.stepValue,
        start: this.container.third.start,
        end: this.container.third.end,
        expr: expr,
        name: '["网络平均带宽"]',
        unit: 'KB/s'
      }).then(data => {
        if (data.success) {
          this.dashboradData.third = Object.assign({}, data.data)
          if (this.thirdInterval) {
            clearInterval(this.thirdInterval)
            this.thirdInterval = ''
          }
          if (this.container.third.step != 0) {
            this.thirdInterval = setInterval(() => {
              this.computeInterval('third', this.container.third.step, this.getThirdChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getFourthChart() {
      const str1 = 'bocloud_fusioncloud_vm_nicDropPercent {id="' + this.detailId + '"}'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.container.fourth.stepValue,
        start: this.container.fourth.start,
        end: this.container.fourth.end,
        expr: expr,
        name: '["网络丢包百分比"]',
        unit: '%'
      }).then(data => {
        if (data.success) {
          this.dashboradData.fourth = Object.assign({}, data.data)
          if (this.fourthInterval) {
            clearInterval(this.fourthInterval)
            this.fourthInterval = ''
          }
          if (this.container.fourth.step != 0) {
            this.fourthInterval = setInterval(() => {
              this.computeInterval('fourth', this.container.fourth.step, this.getFourthChart)
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
          case 'first':
            this.firstDefindTime = value
            this.getFirstChart()
            break
          case 'third':
            this.thirdDefindTime = value
            this.getThirdChart()
            break
          case 'fourth':
            this.fourthDefindTime = value
            this.getFourthChart()
            break
        }
      }
    },
    userDefind(type) {
      this.chartType = type
      switch (type) {
        case 'first':
          this.userDefindTime = this.firstDefindTime
          break
        case 'third':
          this.userDefindTime = this.thirdDefindTime
          break
        case 'fourth':
          this.userDefindTime = this.fourthDefindTime
          break
      }
      this.userDefindVisible = true
    }
  },
  created() {
    this.changeInterval('1H', 'first')
    this.changeInterval('1H', 'third')
    this.changeInterval('1H', 'fourth')
  }
}
</script>
<style></style>
