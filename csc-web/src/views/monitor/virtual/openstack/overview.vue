<template>
  <div>
    <detail-map :detail="detailData" :list="detailMapList" v-if="isShow"></detail-map>
    <el-row :gutter="20" class="m-t">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <el-card class="box-card m-t">
          <div slot="header" class="clearfix">
            <span>
              {{ chart.name }}
            </span>
            <span class="pull-right">
              <el-button-group>
                <el-button size="mini" :type="item.value == disk[chart.value].step ? 'primary' : ''" v-for="item in intervalData" :key="item.value" @click="changeInterval(item.value, chart.value)">{{ item.name }}</el-button>
                <el-button size="mini" :type="disk[chart.value].step === 0 ? 'primary' : ''" @click="userDefind(chart.value)">自定义</el-button>
              </el-button-group>
            </span>
            <div style="clear: both"></div>
          </div>
          <div>
            <line-charts height="220px" width="100%" :id="chart.value" :data="dashboradData[chart.value]" :unit="dashboradData[chart.value].unit" v-if="dashboradData[chart.value]"></line-charts>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <user-defind v-if="userDefindVisible" :user-defind-visible="userDefindVisible" :user-defind-time="userDefindTime" @getData="getOverviewChart"></user-defind>
  </div>
</template>
<script>
import userDefind from '../userDefind.vue'
import { getCharts, getOpenstackVm } from 'services/monitor'
import detailMap from 'views/monitor/components/detailMap.vue'
const intervalData = [
  { name: '1H', value: '1H' },
  { name: '6H', value: '6H' },
  { name: '1D', value: '1D' },
  { name: '7D', value: '7D' },
  { name: '14D', value: '14D' }
]
const typeData = [
  { name: 'CPU利用率', value: 'cpuUtil' },
  { name: '内存利用率', value: 'memoryUsage' },
  { name: '磁盘读写总量', value: 'diskBytes' },
  { name: '磁盘读写速率', value: 'diskBytesRate' },
  { name: '网络传输总量', value: 'networkBytes' },
  { name: '网络传输速率', value: 'networkBytesRate' }
]
export default {
  components: { userDefind, detailMap },
  props: {
    detailId: {
      type: Number
    },
    instanceId: {
      type: String
    },
    isShow: {
      type: Boolean
    }
  },
  data() {
    return {
      detailMapList: [
        { name: 'IP', value: 'managerIp', unit: '' },
        { name: '规格', value: 'flavorName' },
        { name: '创建时间', value: 'gmtVmCreate', unit: '' },
        { name: '操作系统', value: 'osCategory' }
      ],
      intervalData,
      typeData,
      detailData: {},
      dashboradData: {
        cpuUtil: null,
        diskBytes: null,
        diskBytesRate: null,
        networkBytes: null,
        networkBytesRate: null,
        memoryUsage: null
      },
      disk: {
        cpuUtil: {},
        diskBytes: {},
        diskBytesRate: {},
        networkBytes: {},
        networkBytesRate: {},
        memoryUsage: {}
      },
      chartType: '',
      userDefindVisible: false,
      userDefindTime: [],
      cpuUtilDefindTime: [],
      diskBytesDefindTime: [],
      diskBytesRateDefindTime: [],
      networkBytesDefindTime: [],
      networkBytesRateDefindTime: [],
      memoryUsageDefindTime: [],
      cpuUtilTimeInterval: '',
      diskBytesTimeInterval: '',
      diskBytesRateTimeInterval: '',
      networkBytesTimeInterval: '',
      networkBytesRateTimeInterval: '',
      memoryUsageTimeInterval: ''
    }
  },
  methods: {
    goBack() {
      history.go(-1)
    },
    getOverview() {
      getOpenstackVm(this.detailId).then(data => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
        }
      })
    },
    computeInterval(type, value, callback) {
      this.disk[type].end = Math.round(new Date().getTime() / 1000)
      switch (value) {
        case '1H':
          this.disk[type].start = this.disk[type].end - 3600
          break
        case '6H':
          this.disk[type].start = this.disk[type].end - 6 * 3600
          break
        case '1D':
          this.disk[type].start = this.disk[type].end - 24 * 3600
          break
        case '7D':
          this.disk[type].start = this.disk[type].end - 7 * 24 * 3600
          break
        case '14D':
          this.disk[type].start = this.disk[type].end - 14 * 24 * 3600
          break
        default:
          break
      }
      if (value) {
        const duration = this.disk[type].end - this.disk[type].start
        this.disk[type].stepValue = duration / 180 - ((duration / 180) % 20)
        callback()
      }
    },
    // 改变申请概览周期
    changeInterval(value, type) {
      this.chartType = type
      this.disk[type].step = value
      switch (type) {
        case 'cpuUtil':
          this.computeInterval(type, value, this.getCpuUtilChart)
          break
        case 'diskBytes':
          this.computeInterval(type, value, this.getDiskBytesChart)
          break
        case 'diskBytesRate':
          this.computeInterval(type, value, this.getDiskBytesRateChart)
          break
        case 'networkBytes':
          this.computeInterval(type, value, this.getNetworkBytesChart)
          break
        case 'networkBytesRate':
          this.computeInterval(type, value, this.getNetworkBytesRateChart)
          break
        case 'memoryUsage':
          this.computeInterval(type, value, this.getMemoryUsageChart)
          break
      }
    },
    getCpuUtilChart() {
      const str1 = 'round(bocloud_openstack_cpu_util{id="' + this.instanceId + '"}, 0.01)'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.disk.cpuUtil.stepValue,
        start: this.disk.cpuUtil.start,
        end: this.disk.cpuUtil.end,
        expr: expr,
        name: '["cpu利用率"]',
        unit: '%'
      }).then(data => {
        if (data.success) {
          this.dashboradData.cpuUtil = Object.assign({}, data.data)
          if (this.cpuUtilTimeInterval) {
            clearInterval(this.cpuUtilTimeInterval)
            this.cpuUtilTimeInterval = ''
          }
          if (this.disk.cpuUtil.step != 0) {
            this.cpuUtilTimeInterval = setInterval(() => {
              this.computeInterval('cpuUtil', this.disk.cpuUtil.step, this.getCpuUtilChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getDiskBytesChart() {
      const str1 = 'round(bocloud_openstack_disk_read_bytes{id="' + this.instanceId + '"}/ 1024,0.01)'
      const str2 = 'round(bocloud_openstack_disk_write_bytes{id="' + this.instanceId + '"}/ 1024,0.01)'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.disk.diskBytes.stepValue,
        start: this.disk.diskBytes.start,
        end: this.disk.diskBytes.end,
        expr: expr,
        name: '["读取", "写入"]',
        unit: 'KB'
      }).then(data => {
        if (data.success) {
          this.dashboradData.diskBytes = Object.assign({}, data.data)
          if (this.diskBytesTimeInterval) {
            clearInterval(this.diskBytesTimeInterval)
            this.diskBytesTimeInterval = ''
          }
          if (this.disk.diskBytes.step != 0) {
            this.diskBytesTimeInterval = setInterval(() => {
              this.computeInterval('diskBytes', this.disk.diskBytes.step, this.getDiskBytesChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getDiskBytesRateChart() {
      const str1 = 'round(bocloud_openstack_disk_read_bytes_rate{id="' + this.instanceId + '"} / 1024,0.01)'
      const str2 = 'round(bocloud_openstack_disk_write_bytes_rate{id="' + this.instanceId + '"}/ 1024,0.01)'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.disk.diskBytesRate.stepValue,
        start: this.disk.diskBytesRate.start,
        end: this.disk.diskBytesRate.end,
        expr: expr,
        name: '["读取", "写入"]',
        unit: 'KB/s'
      }).then(data => {
        if (data.success) {
          this.dashboradData.diskBytesRate = Object.assign({}, data.data)
          if (this.diskBytesRateTimeInterval) {
            clearInterval(this.diskBytesRateTimeInterval)
            this.diskBytesRateTimeInterval = ''
          }
          if (this.disk.diskBytesRate.step != 0) {
            this.diskBytesRateTimeInterval = setInterval(() => {
              this.computeInterval('diskBytesRate', this.disk.diskBytesRate.step, this.getDiskBytesRateChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getNetworkBytesChart() {
      const str1 = 'round(bocloud_openstack_network_incoming_bytes{instance_id="' + this.instanceId + '"} / 1024,0.01)'
      const str2 = 'round(bocloud_openstack_network_outgoing_bytes{instance_id="' + this.instanceId + '"}/ 1024,0.01)'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.disk.networkBytes.stepValue,
        start: this.disk.networkBytes.start,
        end: this.disk.networkBytes.end,
        expr: expr,
        name: '["{name}_传入", "{name}_传出"]',
        unit: 'KB'
      }).then(data => {
        if (data.success) {
          this.dashboradData.networkBytes = Object.assign({}, data.data)
          if (this.networkBytesTimeInterval) {
            clearInterval(this.networkBytesTimeInterval)
            this.networkBytesTimeInterval = ''
          }
          if (this.disk.networkBytes.step != 0) {
            this.networkBytesTimeInterval = setInterval(() => {
              this.computeInterval('networkBytes', this.disk.networkBytes.step, this.getNetworkBytesChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getNetworkBytesRateChart() {
      const str1 = 'round(bocloud_openstack_network_incoming_bytes_rate{instance_id="' + this.instanceId + '"} / 1024,0.01)'
      const str2 = 'round(bocloud_openstack_network_outgoing_bytes_rate{instance_id="' + this.instanceId + '"}/ 1024,0.01)'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.disk.networkBytesRate.stepValue,
        start: this.disk.networkBytesRate.start,
        end: this.disk.networkBytesRate.end,
        expr: expr,
        name: '["{name}_传入", "{name}_传出"]',
        unit: 'KB/s'
      }).then(data => {
        if (data.success) {
          this.dashboradData.networkBytesRate = Object.assign({}, data.data)
          if (this.networkBytesRateTimeInterval) {
            clearInterval(this.networkBytesRateTimeInterval)
            this.networkBytesRateTimeInterval = ''
          }
          if (this.disk.networkBytesRate.step != 0) {
            this.networkBytesRateTimeInterval = setInterval(() => {
              this.computeInterval('networkBytesRate', this.disk.networkBytesRate.step, this.getNetworkBytesRateChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getMemoryUsageChart() {
      const str1 = 'round(bocloud_openstack_memory_usage{id="' + this.instanceId + '"}/bocloud_openstack_memory{id="' + this.instanceId + '"} * 100,0.01)'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.disk.memoryUsage.stepValue,
        start: this.disk.memoryUsage.start,
        end: this.disk.memoryUsage.end,
        expr: expr,
        name: '["内存利用率"]',
        unit: '%'
      }).then(data => {
        if (data.success) {
          this.dashboradData.memoryUsage = Object.assign({}, data.data)
          if (this.memoryUsageTimeInterval) {
            clearInterval(this.memoryUsageTimeInterval)
            this.memoryUsageTimeInterval = ''
          }
          if (this.disk.memoryUsage.step != 0) {
            this.memoryUsageTimeInterval = setInterval(() => {
              this.computeInterval('memoryUsage', this.disk.memoryUsage.step, this.getMemoryUsageChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getOverviewChart(value) {
      this.userDefindVisible = false
      if (value) {
        this.disk[this.chartType].step = 0
        this.disk[this.chartType].start = Math.round(value[0] / 1000)
        this.disk[this.chartType].end = Math.round(value[1] / 1000)
        const duration = this.disk[this.chartType].end - this.disk[this.chartType].start
        this.disk[this.chartType].stepValue = duration / 180 - ((duration / 180) % 20)
        switch (this.chartType) {
          case 'cpuUtil':
            this.cpuUtilDefindTime = value
            this.getCpuUtilChart()
            break
          case 'diskBytes':
            this.diskBytesDefindTime = value
            this.getDiskBytesChart()
            break
          case 'diskBytesRate':
            this.diskBytesRateDefindTime = value
            this.getDiskBytesRateChart()
            break
          case 'networkBytes':
            this.networkBytesDefindTime = value
            this.getNetworkBytesChart()
            break
          case 'networkBytesRate':
            this.networkBytesRateDefindTime = value
            this.getNetworkBytesRateChart()
            break
          case 'memoryUsage':
            this.memoryUsageDefindTime = value
            this.getMemoryUsageChart()
            break
        }
      }
    },
    userDefind(type) {
      this.chartType = type
      switch (type) {
        case 'cpuUtil':
          this.userDefindTime = this.cpuUtilDefindTime
          break
        case 'diskBytes':
          this.userDefindTime = this.diskBytesDefindTime
          break
        case 'diskBytesRate':
          this.userDefindTime = this.diskBytesRateDefindTime
          break
        case 'networkBytes':
          this.userDefindTime = this.networkBytesDefindTime
          break
        case 'networkBytesRate':
          this.userDefindTime = this.networkBytesRateDefindTime
          break
        case 'memoryUsage':
          this.userDefindTime = this.memoryUsageDefindTime
          break
      }
      this.userDefindVisible = true
    }
  },
  created() {
    this.getOverview()
    this.changeInterval('1H', 'cpuUtil')
    this.changeInterval('1H', 'memoryUsage')
    this.changeInterval('1H', 'diskBytes')
    this.changeInterval('1H', 'diskBytesRate')
    this.changeInterval('1H', 'networkBytes')
    this.changeInterval('1H', 'networkBytesRate')
  },
  beforeDestroy() {
    clearInterval(this.cpuUtilTimeInterval)
    clearInterval(this.diskBytesTimeInterval)
    clearInterval(this.diskBytesRateTimeInterval)
    clearInterval(this.networkBytesTimeInterval)
    clearInterval(this.networkBytesRateTimeInterval)
    clearInterval(this.memoryUsageTimeInterval)
  }
}
</script>
