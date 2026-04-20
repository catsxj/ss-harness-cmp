<template>
  <div>
    <detail-map :detail="detailData" :list="detailMapList" v-if="isShow"></detail-map>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="box-card m-t" style="height: 289px">
          <div slot="header" class="clearfix">
            <span>使用情况</span>
          </div>
          <div class="text-center">
            <el-col :span="12">
              <div>CPU利用率</div>
              <gauge-charts v-if="usageData.cpuUsage1" height="190px" id="cpuUsage" width="100%" :data="usageData.cpuUsage1"></gauge-charts>
            </el-col>
            <el-col :span="12">
              <div>内存利用率</div>
              <gauge-charts v-if="usageData.memUsage1" height="190px" id="memUsage" width="100%" :data="usageData.memUsage1"></gauge-charts>
            </el-col>
          </div>
        </el-card>
      </el-col>
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
            <line-charts ref="container" height="220px" width="100%" :id="chart.value + 'container'" :data="dashboradData[chart.value]" :unit="dashboradData[chart.value].unit" v-if="dashboradData[chart.value]"></line-charts>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <user-defind v-if="userDefindVisible" :user-defind-visible="userDefindVisible" :user-defind-time="userDefindTime" @getData="getOverviewChart"></user-defind>
  </div>
</template>
<script>
import userDefind from '../userDefind.vue'
import { getCharts, getOpenstackHost, getUsage, getOpenstackVm } from 'services/monitor'
import detailMap from 'views/monitor/components/detailMap.vue'
const intervalData = [
  { name: '1H', value: '1H' },
  { name: '6H', value: '6H' },
  { name: '1D', value: '1D' },
  { name: '7D', value: '7D' },
  { name: '14D', value: '14D' }
]
const typeData = [
  { name: 'CPU利用率', value: 'first' },
  { name: '内存利用率', value: 'second' },
  { name: '磁盘IOPS', value: 'third' },
  { name: '磁盘读写速度', value: 'fourth' },
  { name: '磁盘读写总量', value: 'fifth' },
  { name: '网络传输速度', value: 'sixth' },
  { name: '网络传输总量', value: 'seventh' }
]
export default {
  components: { userDefind, detailMap },
  props: {
    detailId: {
      type: Number
    },
    identifier: {
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
      usageData: {},
      detailData: {},
      dashboradData: {
        first: null,
        second: null,
        third: null,
        fourth: null,
        fifth: null,
        sixth: null,
        seventh: null
      },
      container: {
        first: {},
        second: {},
        third: {},
        fourth: {},
        fifth: {},
        sixth: {},
        seventh: {}
      },
      chartType: '',
      userDefindVisible: false,
      userDefindTime: [],
      firstDefindTime: [],
      secondDefindTime: [],
      thirdDefindTime: [],
      fourthDefindTime: [],
      fifthDefindTime: [],
      sixthDefindTime: [],
      seventhDefindTime: [],
      firstTimeInterval: '',
      secondTimeInterval: '',
      thirdTimeInterval: '',
      fourthTimeInterval: '',
      fifthTimeInterval: '',
      sixthTimeInterval: '',
      seventhTimeInterval: '',
      cpuUsageTimeInterval: '',
      memUsageTimeInterval: ''
    }
  },
  methods: {
    getOverview() {
      getOpenstackVm(this.detailId).then(data => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
        }
      })
    },
    getCpuUsage() {
      const expr = 'round((avg(irate(libvirt_domain_info_cpu_time_seconds_total{instanceId="' + this.identifier + '"}[5m])) by (instanceId))*100/ avg(libvirt_domain_info_virtual_cpus) by (instanceId),0.01)'
      getUsage({
        expr: expr,
        simple: true
      }).then(data => {
        if (data.success) {
          this.$set(this.usageData, 'cpuUsage1', {
            name: 'CPU利用率',
            data: { value: data.data, name: '%' },
            min: 0,
            max: 100
          })
          if (this.cpuUsageTimeInterval) {
            clearInterval(this.cpuUsageTimeInterval)
            this.cpuUsageTimeInterval = ''
          }
          this.cpuUsageTimeInterval = setInterval(() => {
            this.getCpuUsage()
          }, 60 * 1000)
        }
      })
    },
    getMemUsage() {
      const expr = 'round((1-libvirt_domain_memory_stat_unused/libvirt_domain_memory_stat_available{instanceId="' + this.identifier + '"})*100,0.01)'
      getUsage({
        expr: expr,
        simple: true
      }).then(data => {
        if (data.success) {
          this.$set(this.usageData, 'memUsage1', {
            name: '内存利用率',
            data: { value: data.data, name: '%' },
            min: 0,
            max: 100
          })
          if (this.memUsageTimeInterval) {
            clearInterval(this.memUsageTimeInterval)
            this.memUsageTimeInterval = ''
          }
          this.memUsageTimeInterval = setInterval(() => {
            this.getMemUsage()
          }, 60 * 1000)
        }
      })
    },
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
        case 'sixth':
          this.computeInterval(type, value, this.getSixthChart)
          break
        case 'seventh':
          this.computeInterval(type, value, this.getSeventhChart)
          break
      }
    },
    getFirstChart() {
      const str1 = 'round((avg(irate(libvirt_domain_info_cpu_time_seconds_total{instanceId="' + this.identifier + '"}[5m])) by (instanceId))*100/ avg(libvirt_domain_info_virtual_cpus) by (instanceId),0.01)'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.container.first.stepValue,
        start: this.container.first.start,
        end: this.container.first.end,
        expr: expr,
        name: '["CPU利用率"]',
        unit: '%'
      }).then(data => {
        if (data.success) {
          this.dashboradData.first = Object.assign({}, data.data)
          if (this.firstTimeInterval) {
            clearInterval(this.firstTimeInterval)
            this.firstTimeInterval = ''
          }
          if (this.container.first.step != 0) {
            this.firstTimeInterval = setInterval(() => {
              this.computeInterval('first', this.container.first.step, this.getFirstChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getSecondChart() {
      const str1 = 'round((1-libvirt_domain_memory_stat_unused/libvirt_domain_memory_stat_available{instanceId="' + this.identifier + '"})*100,0.01)'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.container.second.stepValue,
        start: this.container.second.start,
        end: this.container.second.end,
        expr: expr,
        name: '["内存利用率"]',
        unit: '%'
      }).then(data => {
        if (data.success) {
          this.dashboradData.second = Object.assign({}, data.data)
          if (this.secondTimeInterval) {
            clearInterval(this.secondTimeInterval)
            this.secondTimeInterval = ''
          }
          if (this.container.second.step != 0) {
            this.secondTimeInterval = setInterval(() => {
              this.computeInterval('second', this.container.second.step, this.getSecondChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getThirdChart() {
      const str1 = 'round(sum(irate(libvirt_domain_block_stats_read_requests_total{instanceId="' + this.identifier + '"}[5m])) by (instanceId))'
      const str2 = 'round(sum(irate(libvirt_domain_block_stats_write_requests_total{instanceId="' + this.identifier + '"}[5m])) by (instanceId))'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.container.third.stepValue,
        start: this.container.third.start,
        end: this.container.third.end,
        expr: expr,
        name: '["读取","写入"]',
        unit: 'IO/s'
      }).then(data => {
        if (data.success) {
          this.dashboradData.third = Object.assign({}, data.data)
          if (this.thirdTimeInterval) {
            clearInterval(this.thirdTimeInterval)
            this.thirdTimeInterval = ''
          }
          if (this.container.third.step != 0) {
            this.thirdTimeInterval = setInterval(() => {
              this.computeInterval('third', this.container.third.step, this.getThirdChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getFourthChart() {
      const str1 = 'round(sum(irate(libvirt_domain_block_stats_read_bytes_total{instanceId="' + this.identifier + '"}[5m])) by (instanceId)/1024)'
      const str2 = 'round(sum(irate(libvirt_domain_block_stats_write_bytes_total{instanceId="' + this.identifier + '"}[5m])) by (instanceId)/1024)'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.container.fourth.stepValue,
        start: this.container.fourth.start,
        end: this.container.fourth.end,
        expr: expr,
        name: '["读取","写入"]',
        unit: 'KB/s'
      }).then(data => {
        if (data.success) {
          this.dashboradData.fourth = Object.assign({}, data.data)
          if (this.fourthTimeInterval) {
            clearInterval(this.fourthTimeInterval)
            this.fourthTimeInterval = ''
          }
          if (this.container.fourth.step != 0) {
            this.fourthTimeInterval = setInterval(() => {
              this.computeInterval('fourth', this.container.fourth.step, this.getFourthChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getFifthChart() {
      const str1 = 'round(sum(libvirt_domain_block_stats_read_bytes_total{instanceId="' + this.identifier + '"})/1024)'
      const str2 = 'round(sum(libvirt_domain_block_stats_write_bytes_total{instanceId="' + this.identifier + '"})/1024)'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.container.fifth.stepValue,
        start: this.container.fifth.start,
        end: this.container.fifth.end,
        expr: expr,
        name: '["读取","写入"]',
        unit: 'KB'
      }).then(data => {
        if (data.success) {
          this.dashboradData.fifth = Object.assign({}, data.data)
          if (this.fifthTimeInterval) {
            clearInterval(this.fifthTimeInterval)
            this.fifthTimeInterval = ''
          }
          if (this.container.fifth.step != 0) {
            this.fifthTimeInterval = setInterval(() => {
              this.computeInterval('fifth', this.container.fifth.step, this.getFifthChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getSixthChart() {
      const str1 = 'round(irate(libvirt_domain_interface_stats_receive_bytes_total{instanceId="' + this.identifier + '"}[5m])/1024)'
      const str2 = 'round(irate(libvirt_domain_interface_stats_transmit_bytes_total{instanceId="' + this.identifier + '"}[5m])/1024)'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.container.sixth.stepValue,
        start: this.container.sixth.start,
        end: this.container.sixth.end,
        expr: expr,
        name: '["{target_device}_传入","{target_device}_传出"]',
        unit: 'KB/s'
      }).then(data => {
        if (data.success) {
          this.dashboradData.sixth = Object.assign({}, data.data)
          if (this.sixthTimeInterval) {
            clearInterval(this.sixthTimeInterval)
            this.sixthTimeInterval = ''
          }
          if (this.container.sixth.step != 0) {
            this.sixthTimeInterval = setInterval(() => {
              this.computeInterval('sixth', this.container.sixth.step, this.getSixthChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getSeventhChart() {
      const str1 = 'round(libvirt_domain_interface_stats_receive_bytes_total{instanceId="' + this.identifier + '"} / 1024)'
      const str2 = 'round(libvirt_domain_interface_stats_transmit_bytes_total{instanceId="' + this.identifier + '"} / 1024)'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.container.seventh.stepValue,
        start: this.container.seventh.start,
        end: this.container.seventh.end,
        expr: expr,
        name: '["{target_device}_传入","{target_device}_传出"]',
        unit: 'KB'
      }).then(data => {
        if (data.success) {
          this.dashboradData.seventh = Object.assign({}, data.data)
          if (this.seventhTimeInterval) {
            clearInterval(this.seventhTimeInterval)
            this.seventhTimeInterval = ''
          }
          if (this.container.seventh.step != 0) {
            this.seventhTimeInterval = setInterval(() => {
              this.computeInterval('seventh', this.container.seventh.step, this.getSeventhChart)
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
          case 'sixth':
            this.sixthDefindTime = value
            this.getSixthChart()
            break
          case 'seventh':
            this.seventhDefindTime = value
            this.getSeventhChart()
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
        case 'third':
          this.userDefindTime = this.thirdDefindTime
          break
        case 'fourth':
          this.userDefindTime = this.fourthDefindTime
          break
        case 'fifth':
          this.userDefindTime = this.fifthDefindTime
          break
        case 'sixth':
          this.userDefindTime = this.sixthDefindTime
          break
        case 'seventh':
          this.userDefindTime = this.seventhDefindTime
          break
      }
      this.userDefindVisible = true
    }
  },
  created() {
    this.getOverview()
    this.getCpuUsage()
    this.getMemUsage()
    this.changeInterval('1H', 'first')
    this.changeInterval('1H', 'second')
    this.changeInterval('1H', 'third')
    this.changeInterval('1H', 'fourth')
    this.changeInterval('1H', 'fifth')
    this.changeInterval('1H', 'sixth')
    this.changeInterval('1H', 'seventh')
  },
  beforeDestroy() {
    clearInterval(this.cpuUsageTimeInterval)
    clearInterval(this.memUsageTimeInterval)
    clearInterval(this.firstTimeInterval)
    clearInterval(this.secondTimeInterval)
    clearInterval(this.thirdTimeInterval)
    clearInterval(this.fourthTimeInterval)
    clearInterval(this.fifthTimeInterval)
    clearInterval(this.sixthTimeInterval)
    clearInterval(this.seventhTimeInterval)
  }
}
</script>
<style></style>
