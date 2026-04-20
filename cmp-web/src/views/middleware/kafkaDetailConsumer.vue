<template>
  <div>
    <basic-form label-width="150px">
      <el-row>
        <el-col :span="8">
          <el-form-item label="consumer group：">
            <el-select v-model="consumer" placeholder="请选择" @change="changeConsumer">
              <el-option v-for="item in consumerData" :key="item.name" :label="item.name" :value="item.name"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </basic-form>
    <el-row :gutter="5">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <el-card class="box-card m-t-xs">
          <div slot="header" class="clearfix">
            <span>
              {{ chart.name }}
            </span>
            <span class="pull-right">
              <el-button-group>
                <el-button size="mini" :type="item.value == obj[chart.value].step ? 'primary' : ''" v-for="item in intervalData" :key="item.value" @click="changeInterval(item.value, chart.value)">{{ item.name }}</el-button>
                <el-button size="mini" :type="obj[chart.value].step === 0 ? 'primary' : ''" @click="userDefind(chart.value)">自定义</el-button>
              </el-button-group>
            </span>
          </div>
          <div>
            <line-charts height="220px" width="100%" :id="chart.value + 'obj'" :data="dashboradData[chart.value]" :unit="dashboradData[chart.value].unit" v-if="dashboradData[chart.value]"></line-charts>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <user-defind v-if="userDefindVisible" :user-defind-visible="userDefindVisible" :user-defind-time="userDefindTime" @getData="getOverviewChart"></user-defind>
  </div>
</template>
<script>
import userDefind from '../compute/cloud/hostDetail/userDefind.vue'
import { getCharts } from 'services/monitor'
import { getCmsConsumer } from 'services/monitor/middleware'
const intervalData = [
  { name: '1H', value: '1H' },
  { name: '6H', value: '6H' },
  { name: '1D', value: '1D' },
  { name: '7D', value: '7D' },
  { name: '14D', value: '14D' }
]
const typeData = [
  { name: '已消费消息数', value: 'first' },
  { name: '消息堆积数', value: 'second' }
]
export default {
  components: { userDefind },
  props: {
    detailId: {
      type: Number
    }
  },
  data() {
    return {
      intervalData,
      typeData,
      consumer: '',
      consumerData: [],
      dashboradData: {
        first: null,
        second: null
      },
      obj: {
        first: {},
        second: {}
      },
      chartType: '',
      userDefindVisible: false,
      userDefindTime: [],
      firstDefindTime: [],
      secondDefindTime: [],
      firstTimeInterval: '',
      secondTimeInterval: ''
    }
  },
  methods: {
    getConsumerData() {
      getCmsConsumer(this.detailId).then((data) => {
        if (data.success) {
          this.consumerData = data.data
          if (this.consumerData.length) {
            this.consumer = this.consumerData[0].name
            this.changeInterval('1H', 'first')
            this.changeInterval('1H', 'second')
          }
        }
      })
    },
    changeConsumer() {
      clearInterval(this.firstTimeInterval)
      clearInterval(this.secondTimeInterval)
      this.computeInterval('first', this.obj.first.step, this.getFirstChart)
      this.computeInterval('second', this.obj.second.step, this.getSecondChart)
    },
    computeInterval(type, value, callback) {
      this.obj[type].end = Math.round(new Date().getTime() / 1000)
      switch (value) {
        case '1H':
          this.obj[type].start = this.obj[type].end - 3600
          break
        case '6H':
          this.obj[type].start = this.obj[type].end - 6 * 3600
          break
        case '1D':
          this.obj[type].start = this.obj[type].end - 24 * 3600
          break
        case '7D':
          this.obj[type].start = this.obj[type].end - 7 * 24 * 3600
          break
        case '14D':
          this.obj[type].start = this.obj[type].end - 14 * 24 * 3600
          break
        default:
          break
      }
      if (value) {
        const duration = this.obj[type].end - this.obj[type].start
        this.obj[type].stepValue = duration / 180 - ((duration / 180) % 20)
        callback()
      }
    },
    // 改变申请概览周期
    changeInterval(value, type) {
      this.chartType = type
      this.obj[type].step = value
      switch (type) {
        case 'first':
          this.computeInterval(type, value, this.getFirstChart)
          break
        case 'second':
          this.computeInterval(type, value, this.getSecondChart)
          break
      }
    },
    getFirstChart() {
      const str1 = 'topk(1,sum(kafka_consumergroup_current_offset{cms_id="' + this.detailId + '",consumergroup="' + this.consumer + '"}) by (topic,server,port))'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.obj.first.stepValue,
        start: this.obj.first.start,
        end: this.obj.first.end,
        expr: expr,
        name: '["{topic}"]',
        unit: '个'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.first = Object.assign({}, data.data)
          if (this.firstTimeInterval) {
            clearInterval(this.firstTimeInterval)
            this.firstTimeInterval = ''
          }
          if (this.obj.first.step != 0) {
            this.firstTimeInterval = setInterval(() => {
              this.computeInterval('first', this.obj.first.step, this.getFirstChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getSecondChart() {
      const str1 = 'topk(1,sum(kafka_consumergroup_lag{cms_id="' + this.detailId + '",consumergroup="' + this.consumer + '"}) by (topic,server,port))'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.obj.second.stepValue,
        start: this.obj.second.start,
        end: this.obj.second.end,
        expr: expr,
        name: '["{topic}"]',
        unit: '个'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.second = Object.assign({}, data.data)
          if (this.secondTimeInterval) {
            clearInterval(this.secondTimeInterval)
            this.secondTimeInterval = ''
          }
          if (this.obj.second.step != 0) {
            this.secondTimeInterval = setInterval(() => {
              this.computeInterval('second', this.obj.second.step, this.getSecondChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getOverviewChart(value) {
      this.userDefindVisible = false
      if (value) {
        this.obj[this.chartType].step = 0
        this.obj[this.chartType].start = Math.round(value[0] / 1000)
        this.obj[this.chartType].end = Math.round(value[1] / 1000)
        const duration = this.obj[this.chartType].end - this.obj[this.chartType].start
        this.obj[this.chartType].stepValue = duration / 180 - ((duration / 180) % 20)
        switch (this.chartType) {
          case 'first':
            this.firstDefindTime = value
            this.getFirstChart()
            break
          case 'second':
            this.secondDefindTime = value
            this.getSecondChart()
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
        case 'second':
          this.userDefindTime = this.secondDefindTime
          break
      }
      this.userDefindVisible = true
    }
  },
  created() {
    this.getConsumerData()
  },
  beforeDestroy() {
    clearInterval(this.firstTimeInterval)
    clearInterval(this.secondTimeInterval)
  }
}
</script>
