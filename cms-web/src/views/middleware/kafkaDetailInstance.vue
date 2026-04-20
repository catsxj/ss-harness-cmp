<template>
  <div>
    <basic-form label-width="60px">
      <el-row>
        <el-col :span="8">
          <basic-form-item label="节点：">
            <el-select v-model="node" placeholder="请选择" @change="changeNode">
              <el-option v-for="item in nodesData" :key="item.id" :label="item.address + ':' + item.port + '(' + item.role + ')'" :value="item.id"> </el-option>
            </el-select>
          </basic-form-item>
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
const intervalData = [
  { name: '1H', value: '1H' },
  { name: '6H', value: '6H' },
  { name: '1D', value: '1D' },
  { name: '7D', value: '7D' },
  { name: '14D', value: '14D' }
]
const typeData = [
  { name: '每秒消息数', value: 'first' },
  { name: '流量统计', value: 'second' }
]
export default {
  components: { userDefind },
  props: {
    detailId: {
      type: Number
    },
    detail: {
      type: Object
    }
  },
  data() {
    return {
      intervalData,
      typeData,
      node: '',
      nodesData: [],
      server: '',
      port: '',
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
    getNodesData() {
      this.nodesData = []
      this.detail.nodes.forEach((item) => {
        this.nodesData.push(item)
        if (this.nodesData.length == 1) {
          this.node = this.nodesData[0].id
          this.server = this.nodesData[0].address
          this.port = this.nodesData[0].port
          this.handleClick()
        }
      })
    },
    changeNode(id) {
      for (let index = 0; index < this.nodesData.length; index++) {
        const element = this.nodesData[index]
        if (id == element.id) {
          this.server = element.address
          this.port = element.port
          this.computeInterval('first', this.obj.first.step, this.getFirstChart)
          this.computeInterval('second', this.obj.second.step, this.getSecondChart)
          return
        }
      }
    },
    handleClick() {
      this.changeInterval('1H', 'first')
      this.changeInterval('1H', 'second')
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
      const expr = JSON.stringify(['round(irate(kafka_server_brokertopicmetrics_messagesin_total{cms_id="' + this.detailId + '",topic="",server="' + this.server + '",port="' + this.port + '"}[5m]),0.01)'])
      getCharts({
        step: this.obj.first.stepValue,
        start: this.obj.first.start,
        end: this.obj.first.end,
        expr: expr,
        name: '["消息数"]',
        unit: '个/s'
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
      const str1 = 'round(1/1024*irate(kafka_server_brokertopicmetrics_bytesin_total{cms_id="' + this.detailId + '",topic="",server="' + this.server + '",port="' + this.port + '"}[5m]),0.01)'
      const str2 = 'round(1/1024*irate(kafka_server_brokertopicmetrics_bytesout_total{cms_id="' + this.detailId + '",topic="",server="' + this.server + '",port="' + this.port + '"}[5m]),0.01)'
      const str3 = 'round(1/1024*irate(kafka_server_brokertopicmetrics_bytesrejected_total{cms_id="' + this.detailId + '",topic="",server="' + this.server + '",port="' + this.port + '"}[5m]),0.01)'
      const expr = JSON.stringify([str1, str2, str3])
      getCharts({
        step: this.obj.second.stepValue,
        start: this.obj.second.start,
        end: this.obj.second.end,
        expr: expr,
        name: '["in","out","rejected"]',
        unit: 'KB/s'
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
    this.getNodesData()
  },
  beforeDestroy() {
    clearInterval(this.firstTimeInterval)
    clearInterval(this.secondTimeInterval)
  }
}
</script>
