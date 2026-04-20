<template>
  <div>
    <detail-map :detail="detailData" :list="detailMapList" v-if="isShow"></detail-map>
    <el-row :gutter="20">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <el-card class="box-card m-t">
          <div slot="header" class="clearfix">
            <span>
              {{ chart.name }}
            </span>
            <span class="pull-right">
              <el-button-group>
                <el-button size="mini" :type="item.value == node[chart.value].step ? 'primary' : ''" v-for="item in intervalData" :key="item.value" @click="changeInterval(item.value, chart.value)">{{ item.name }}</el-button>
                <el-button size="mini" :type="node[chart.value].step === 0 ? 'primary' : ''" @click="userDefind(chart.value)">自定义</el-button>
              </el-button-group>
            </span>
          </div>
          <div>
            <line-charts height="220px" width="100%" :id="chart.value + 'Node'" :data="dashboradData[chart.value]" :unit="dashboradData[chart.value].unit" v-if="dashboradData[chart.value]"></line-charts>
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
import detailMap from 'views/monitor/components/detailMap.vue'
const intervalData = [
  { name: '1H', value: '1H' },
  { name: '6H', value: '6H' },
  { name: '1D', value: '1D' },
  { name: '7D', value: '7D' },
  { name: '14D', value: '14D' }
]
const typeData = [
  { name: 'CPU利用率', value: 'cpu' },
  { name: '内存利用率', value: 'memory' },
  { name: '网络速率', value: 'net' },
  { name: '磁盘操作速率', value: 'disk' },
  { name: '云硬盘利用率', value: 'diskUsage' },
  { name: 'CPU额度', value: 'cpuload' }
]
export default {
  components: { userDefind, detailMap },
  props: {
    detailId: {
      type: String
    },
    detailData: {
      type: Object
    },
    isShow: {
      type: Boolean
    }
  },
  data() {
    return {
      detailMapList: [
        { name: '名称', value: 'name' },
        { name: 'IP', value: 'ip', unit: '' }
      ],
      intervalData,
      typeData,
      dashboradData: {
        cpu: null,
        memory: null,
        net: null,
        diskUsage: null,
        disk: null,
        cpuload: null
      },
      node: {
        cpu: {},
        memory: {},
        net: {},
        diskUsage: {},
        disk: {},
        cpuload: {}
      },
      chartType: '',
      userDefindVisible: false,
      userDefindTime: [],
      cpuDefindTime: [],
      memoryDefindTime: [],
      netDefindTime: [],
      diskUsageDefindTime: [],
      diskDefindTime: [],
      cpuloadDefindTime: [],
      cpuInterval: '',
      memoryInterval: '',
      netInterval: '',
      diskUsageInterval: '',
      diskInterval: '',
      cpuloadInterval: ''
    }
  },
  beforeDestroy() {
    clearInterval(this.memoryInterval)
    clearInterval(this.netInterval)
    clearInterval(this.cpuInterval)
    clearInterval(this.diskUsageInterval)
    clearInterval(this.diskInterval)
    clearInterval(this.cpuloadInterval)
  },
  methods: {
    getDetail() {
      let ip = ''
      const array = JSON.parse(this.detailData.privateIps) || []
      array.forEach(item => {
        item.addresses.forEach(item1 => {
          ip = ip + item1.address + ','
        })
      })
      ip = ip.substring(0, ip.length - 1)
      this.detailData.ip = ip
    },
    computeInterval(type, value, callback) {
      this.node[type].end = Math.round(new Date().getTime() / 1000)
      switch (value) {
        case '1H':
          this.node[type].start = this.node[type].end - 3600
          break
        case '6H':
          this.node[type].start = this.node[type].end - 6 * 3600
          break
        case '1D':
          this.node[type].start = this.node[type].end - 24 * 3600
          break
        case '7D':
          this.node[type].start = this.node[type].end - 7 * 24 * 3600
          break
        case '14D':
          this.node[type].start = this.node[type].end - 14 * 24 * 3600
          break
        default:
          break
      }
      if (value) {
        const duration = this.node[type].end - this.node[type].start
        this.node[type].stepValue = duration / 180 - ((duration / 180) % 20)
        callback()
      }
    },
    // 改变申请概览周期
    changeInterval(value, type) {
      this.chartType = type
      this.node[type].step = value
      switch (type) {
        case 'cpu':
          this.computeInterval(type, value, this.getCpuChart)
          break
        case 'memory':
          this.computeInterval(type, value, this.getMemoryChart)
          break
        case 'net':
          this.computeInterval(type, value, this.getNetChart)
          break
        case 'diskUsage':
          this.computeInterval(type, value, this.getDiskUsageChart)
          break
        case 'disk':
          this.computeInterval(type, value, this.getDiskChart)
          break
        case 'cpuload':
          this.computeInterval(type, value, this.getCpuloadChart)
          break
      }
    },
    getCpuChart() {
      const str1 = 'bocloud_fusioncloud_vm_cpuUsage{id="' + this.detailId + '"}'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.node.cpu.stepValue,
        start: this.node.cpu.start,
        end: this.node.cpu.end,
        expr: expr,
        name: '["CPU利用率"]',
        unit: '%'
      }).then(data => {
        if (data.success) {
          this.dashboradData.cpu = Object.assign({}, data.data)
          if (this.cpuInterval) {
            clearInterval(this.cpuInterval)
            this.cpuInterval = ''
          }
          if (this.node.cpu.step != 0) {
            this.cpuInterval = setInterval(() => {
              this.computeInterval('cpu', this.node.cpu.step, this.getCpuChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getMemoryChart() {
      const str1 = ' bocloud_fusioncloud_vm_memoryUsage{id="' + this.detailId + '"}'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.node.memory.stepValue,
        start: this.node.memory.start,
        end: this.node.memory.end,
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
          if (this.node.memory.step != 0) {
            this.memoryInterval = setInterval(() => {
              this.computeInterval('memory', this.node.memory.step, this.getMemoryChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getNetChart() {
      const str1 = 'bocloud_fusioncloud_vm_nicByteIn{id="' + this.detailId + '"}'
      const str2 = 'bocloud_fusioncloud_vm_nicByteOut{id="' + this.detailId + '"}'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.node.net.stepValue,
        start: this.node.net.start,
        end: this.node.net.end,
        expr: expr,
        name: '["网络流入速率", "网络流出速率"]',
        unit: 'KB/s'
      }).then(data => {
        if (data.success) {
          this.dashboradData.net = Object.assign({}, data.data)
          if (this.netInterval) {
            clearInterval(this.netInterval)
            this.netInterval = ''
          }
          if (this.node.net.step != 0) {
            this.netInterval = setInterval(() => {
              this.computeInterval('net', this.node.net.step, this.getNetChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getDiskUsageChart() {
      const str1 = 'bocloud_fusioncloud_vm_diskUsage{id="' + this.detailId + '"}'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.node.diskUsage.stepValue,
        start: this.node.diskUsage.start,
        end: this.node.diskUsage.end,
        expr: expr,
        name: '["云硬盘利用率"]',
        unit: '%'
      }).then(data => {
        if (data.success) {
          this.dashboradData.diskUsage = Object.assign({}, data.data)
          if (this.diskUsageInterval) {
            clearInterval(this.diskUsageInterval)
            this.diskUsageInterval = ''
          }
          if (this.node.diskUsage.step != 0) {
            this.diskUsageInterval = setInterval(() => {
              this.computeInterval('diskUsage', this.node.diskUsage.step, this.getDiskUsageChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getDiskChart() {
      const str1 = 'bocloud_fusioncloud_vm_disk_read_requests_rate{id="' + this.detailId + '"}'
      const str2 = 'bocloud_fusioncloud_vm_disk_write_requests_rate{id="' + this.detailId + '"}'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.node.disk.stepValue,
        start: this.node.disk.start,
        end: this.node.disk.end,
        expr: expr,
        name: '["磁盘读操作速率", "磁盘写操作速率"]',
        unit: 'IO/s'
      }).then(data => {
        if (data.success) {
          this.dashboradData.disk = Object.assign({}, data.data)
          if (this.diskInterval) {
            clearInterval(this.diskInterval)
            this.diskInterval = ''
          }
          if (this.node.disk.step != 0) {
            this.diskInterval = setInterval(() => {
              this.computeInterval('disk', this.node.disk.step, this.getDiskChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getCpuloadChart() {
      const str1 = 'bocloud_fusioncloud_vm_cpu_credit_usage{id="' + this.detailId + '"}'
      const str2 = 'bocloud_fusioncloud_vm_cpu_credit_balance{id="' + this.detailId + '"}'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.node.cpuload.stepValue,
        start: this.node.cpuload.start,
        end: this.node.cpuload.end,
        expr: expr,
        name: '["CPU额度使用", "CPU额度余额"]',
        unit: ''
      }).then(data => {
        if (data.success) {
          this.dashboradData.cpuload = Object.assign({}, data.data)
          if (this.cpuloadInterval) {
            clearInterval(this.cpuloadInterval)
            this.cpuloadInterval = ''
          }
          if (this.node.cpuload.step != 0) {
            this.cpuloadInterval = setInterval(() => {
              this.computeInterval('cpuload', this.node.cpuload.step, this.getCpuloadChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getOverviewChart(value) {
      this.userDefindVisible = false
      if (value) {
        this.node[this.chartType].step = 0
        this.node[this.chartType].start = Math.round(value[0] / 1000)
        this.node[this.chartType].end = Math.round(value[1] / 1000)
        const duration = this.node[this.chartType].end - this.node[this.chartType].start
        this.node[this.chartType].stepValue = duration / 180 - ((duration / 180) % 20)
        switch (this.chartType) {
          case 'cpu':
            this.cpuDefindTime = value
            this.getCpuChart()
            break
          case 'memory':
            this.memoryDefindTime = value
            this.getMemoryChart()
            break
          case 'net':
            this.netDefindTime = value
            this.getNetChart()
            break
          case 'diskUsage':
            this.diskUsageDefindTime = value
            this.getDiskUsageChart()
            break
          case 'disk':
            this.diskDefindTime = value
            this.getDiskChart()
            break
          case 'cpuload':
            this.cpuloadDefindTime = value
            this.getCpuloadChart()
            break
        }
      }
    },
    userDefind(type) {
      this.chartType = type
      switch (type) {
        case 'cpu':
          this.userDefindTime = this.cpuDefindTime
          break
        case 'memory':
          this.userDefindTime = this.memoryDefindTime
          break
        case 'net':
          this.userDefindTime = this.netDefindTime
          break
        case 'diskUsage':
          this.userDefindTime = this.diskUsageDefindTime
          break
        case 'disk':
          this.userDefindTime = this.diskDefindTime
          break
        case 'cpuload':
          this.userDefindTime = this.cpuloadDefindTime
          break
      }
      this.userDefindVisible = true
    }
  },
  created() {
    this.getDetail()
    this.changeInterval('1H', 'cpu')
    this.changeInterval('1H', 'memory')
    this.changeInterval('1H', 'net')
    this.changeInterval('1H', 'diskUsage')
    this.changeInterval('1H', 'disk')
    this.changeInterval('1H', 'cpuload')
  }
}
</script>
<style scoped>
.box-card .basic-info .attr-name {
  display: inline-block;
  white-space: nowrap;
  color: #999;
  width: 98px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.box-card .basic-info .attr {
  font-size: 12px;
  margin-bottom: 12px;
}
</style>
