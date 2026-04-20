<template>
  <div>
    <el-row :gutter="5">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <el-card class="box-card m-t-xs">
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
import userDefind from '../../compute/cloud/hostDetail/userDefind.vue'
import { getCharts } from 'services/monitor'
const intervalData = [
  { name: '1H', value: '1H' },
  { name: '6H', value: '6H' },
  { name: '1D', value: '1D' },
  { name: '7D', value: '7D' },
  { name: '14D', value: '14D' }
]
const typeData = [
  { name: 'IOPS', value: 'second' },
  { name: 'IO响应时间', value: 'third' },
  { name: '数据性能', value: 'fourth' },
  { name: 'Cache性能', value: 'fifth' }
]
export default {
  components: { userDefind },
  props: {
    detailUuid: {
      type: String
    }
  },
  data() {
    return {
      intervalData,
      typeData,
      dashboradData: {
        second: null,
        third: null,
        fourth: null,
        fifth: null
      },
      container: {
        second: {},
        third: {},
        fourth: {},
        fifth: {}
      },
      chartType: '',
      userDefindVisible: false,
      userDefindTime: [],
      secondDefindTime: [],
      thirdDefindTime: [],
      fourthDefindTime: [],
      fifthDefindTime: [],
      secondInterval: '',
      thirdInterval: '',
      fourthInterval: '',
      fifthInterval: ''
    }
  },
  beforeDestroy() {
    clearInterval(this.secondInterval)
    clearInterval(this.thirdInterval)
    clearInterval(this.fourthInterval)
    clearInterval(this.fifthInterval)
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
        case 'second':
          this.computeInterval(type, value, this.getSecondChart)
          break
        case 'third':
          this.computeInterval(type, value, this.getThirdChart)
          break
        case 'fourth':
          this.computeInterval(type, value, this.getFourthChart)
          break
        case 'fifth':
          this.computeInterval(type, value, this.getFifthChart)
          break
      }
    },
    getSecondChart() {
      const str1 = 'bocloud_smis_totalIOs{instanceUuid ="' + this.detailUuid + '",instanceType="volume"}'
      const str2 = 'bocloud_smis_readIOs{instanceUuid ="' + this.detailUuid + '",instanceType="volume"}'
      const str3 = 'bocloud_smis_writeIOs{instanceUuid ="' + this.detailUuid + '",instanceType="volume"}'
      const expr = JSON.stringify([str1, str2, str3])
      getCharts({
        step: this.container.second.stepValue,
        start: this.container.second.start,
        end: this.container.second.end,
        expr: expr,
        name: '["总IOPS", "读IOPS", "写IOPS"]',
        unit: 'IO/s'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.second = Object.assign({}, data.data)
          if (this.secondInterval) {
            clearInterval(this.secondInterval)
            this.secondInterval = ''
          }
          if (this.container.second.step != 0) {
            this.secondInterval = setInterval(() => {
              this.computeInterval('second', this.container.second.step, this.getSecondChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getThirdChart() {
      const str1 = 'bocloud_smis_totalIOt{instanceUuid = "' + this.detailUuid + '",instanceType="volume"}'
      const str2 = 'bocloud_smis_readIOt{instanceUuid = "' + this.detailUuid + '",instanceType="volume"}'
      const str3 = 'bocloud_smis_writeIOt{instanceUuid = "' + this.detailUuid + '",instanceType="volume"}'
      const expr = JSON.stringify([str1, str2, str3])
      getCharts({
        step: this.container.third.stepValue,
        start: this.container.third.start,
        end: this.container.third.end,
        expr: expr,
        name: '["平均IO响应时间", "平均读IO响应时间", "平均写IO响应时间"]',
        unit: 'ms'
      }).then((data) => {
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
      const str1 = 'bocloud_smis_totalKB{instanceUuid = "' + this.detailUuid + '",instanceType="volume"}'
      const str2 = 'bocloud_smis_readKB{instanceUuid = "' + this.detailUuid + '",instanceType="volume"}'
      const str3 = 'bocloud_smis_writeKB{instanceUuid = "' + this.detailUuid + '",instanceType="volume"}'
      const expr = JSON.stringify([str1, str2, str3])
      getCharts({
        step: this.container.fourth.stepValue,
        start: this.container.fourth.start,
        end: this.container.fourth.end,
        expr: expr,
        name: '["传输数据", "读数据", "写数据"]',
        unit: 'kb/s'
      }).then((data) => {
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
    getFifthChart() {
      const str1 = 'bocloud_smis_readHit{instanceUuid = "' + this.detailUuid + '",instanceType="volume"}'
      const str2 = 'bocloud_smis_writeHit{instanceUuid = "' + this.detailUuid + '",instanceType="volume"}'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.container.fifth.stepValue,
        start: this.container.fifth.start,
        end: this.container.fifth.end,
        expr: expr,
        name: '["读Cache命中", "写Cache命中"]',
        unit: '%'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.fifth = Object.assign({}, data.data)
          if (this.fifthInterval) {
            clearInterval(this.fifthInterval)
            this.fifthInterval = ''
          }
          if (this.container.fifth.step != 0) {
            this.fifthInterval = setInterval(() => {
              this.computeInterval('fifth', this.container.fifth.step, this.getFifthChart)
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
          case 'second':
            this.secondDefindTime = value
            this.getSecondChart()
            break
          case 'third':
            this.thirdDefindTime = value
            this.getThirdChart()
            break
          case 'fourth':
            this.fourthDefindTime = value
            this.getFourthChart()
            break
          case 'fifth':
            this.fifthDefindTime = value
            this.getFifthChart()
            break
        }
      }
    },
    userDefind(type) {
      this.chartType = type
      switch (type) {
        case 'second':
          this.userDefindTime = this.secondDefindTime
          break
        case 'third':
          this.userDefindTime = this.thirdDefindTime
          break
        case 'fourth':
          this.userDefindTime = this.fourthDefindTime
          break
        case 'fifth':
          this.userDefindTime = this.fifthDefindTime
          break
      }
      this.userDefindVisible = true
    }
  },
  created() {
    this.changeInterval('1H', 'second')
    this.changeInterval('1H', 'third')
    this.changeInterval('1H', 'fourth')
    this.changeInterval('1H', 'fifth')
  }
}
</script>
<style scoped>
.rate_box {
  background: #7c79b6;
  height: 140px;
  text-align: center;
  color: #fff;
}
.rate_box > p:nth-child(1) {
  height: 50px;
  line-height: 50px;
  margin-bottom: 0;
}
.rate_box > p:nth-child(2) {
  height: 60px;
  line-height: 60px;
  font-size: 32px;
  margin: 0;
}
</style>
