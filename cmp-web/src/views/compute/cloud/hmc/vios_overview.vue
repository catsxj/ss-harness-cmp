<template>
  <div>
    <el-row :gutter="5">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <el-card class="box-card m-t-xs">
          <div slot="header" class="clearfix">
            <span class="pull-left m-r-xs">
              {{ chart.name }}
            </span>
            <el-select class="pull-left" style="width: 90px" filterable v-model="filter" placeholder="请选择" @change="changeFilter" v-if="chart.value == 'stoprocrb'">
              <el-option label="总计" value="total"></el-option>
              <el-option v-for="item in filterData" :key="item" :label="item" :value="item"></el-option>
            </el-select>
            <span class="pull-right">
              <el-button-group>
                <el-button size="mini" :type="item.value == container[chart.value].step ? 'primary' : ''" v-for="item in intervalData" :key="item.value" @click="changeInterval(item.value, chart.value)">{{ item.name }}</el-button>
                <el-button size="mini" :type="container[chart.value].step === 0 ? 'primary' : ''" @click="userDefind(chart.value)">自定义</el-button>
              </el-button-group>
            </span>
            <div style="clear: both"></div>
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
import userDefind from 'views/components/userDefind.vue'
import { getCharts, getfilters } from 'services/monitor'
const intervalData = [
  { name: '1H', value: '1H' },
  { name: '6H', value: '6H' },
  { name: '1D', value: '1D' },
  { name: '7D', value: '7D' },
  { name: '14D', value: '14D' }
]
const typeData = [
  { name: '处理器单元数', value: 'cpu' },
  { name: '内存量', value: 'memory' },
  { name: '网络实时发送速率', value: 'netprocsb' },
  { name: '存储实时读取速率', value: 'stoprocrb' }
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
      filter: 'total',
      filterData: [],
      dashboradData: {
        cpu: null,
        memory: null,
        netprocsb: null,
        stoprocrb: null
      },
      container: {
        cpu: {},
        memory: {},
        netprocsb: {},
        stoprocrb: {}
      },
      chartType: '',
      userDefindVisible: false,
      userDefindTime: [],
      cpuDefindTime: [],
      memoryDefindTime: [],
      netprocsbDefindTime: [],
      stoprocrbDefindTime: [],
      cpuInterval: '',
      memoryInterval: '',
      netprocsbInterval: '',
      stoprocrbInterval: ''
    }
  },
  beforeDestroy() {
    clearInterval(this.memoryInterval)
    clearInterval(this.netprocsbInterval)
    clearInterval(this.cpuInterval)
    clearInterval(this.stoprocrbInterval)
  },
  methods: {
    getFilter() {
      const params = {
        expr: `bocloud_hmc_proc_vios_storage_rb{parentUuid="${this.detailUuid}"}`,
        filter: 'instanceUuid'
      }
      getfilters(params).then((data) => {
        if (data.success) {
          this.filterData = data.data
        }
      })
    },
    changeFilter(value) {
      this.changeInterval(this.container.stoprocrb.step, 'stoprocrb')
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
        case 'cpu':
          this.computeInterval(type, value, this.getCpuChart)
          break
        case 'memory':
          this.computeInterval(type, value, this.getMemoryChart)
          break
        case 'netprocsb':
          this.computeInterval(type, value, this.getNetprocsbChart)
          break
        case 'stoprocrb':
          this.computeInterval(type, value, this.getStoprocrbChart)
          break
      }
    },
    getCpuChart() {
      const str1 = 'bocloud_hmc_proc_vios_cpu_entitled_unit{instanceUuid="' + this.detailUuid + '"}'
      const str2 = 'bocloud_hmc_proc_vios_cpu_utilized_unit{instanceUuid="' + this.detailUuid + '"}'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.container.cpu.stepValue,
        start: this.container.cpu.start,
        end: this.container.cpu.end,
        expr: expr,
        name: "['总量', '已使用']",
        unit: '单元'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.cpu = Object.assign({}, data.data)
          if (this.cpuInterval) {
            clearInterval(this.cpuInterval)
            this.cpuInterval = ''
          }
          if (this.container.cpu.step != 0) {
            this.cpuInterval = setInterval(() => {
              this.computeInterval('cpu', this.container.cpu.step, this.getCpuChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getMemoryChart() {
      const str1 = 'round(bocloud_hmc_proc_vios_mem_total{instanceUuid="' + this.detailUuid + '"} /1024,0.01)'
      const str2 = 'round(bocloud_hmc_proc_vios_mem_utilized{instanceUuid="' + this.detailUuid + '"} /1024,0.01)'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.container.memory.stepValue,
        start: this.container.memory.start,
        end: this.container.memory.end,
        expr: expr,
        name: "['总量', '已使用']",
        unit: 'GB'
      }).then((data) => {
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
    getNetprocsbChart() {
      const str1 = 'bocloud_hmc_proc_vios_network_sb{parentUuid="' + this.detailUuid + '"}'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.container.netprocsb.stepValue,
        start: this.container.netprocsb.start,
        end: this.container.netprocsb.end,
        expr: expr,
        name: '["$instanceUuid"]',
        unit: 'KB/s'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.netprocsb = Object.assign({}, data.data)
          if (this.netprocsbInterval) {
            clearInterval(this.netprocsbInterval)
            this.netprocsbInterval = ''
          }
          if (this.container.netprocsb.step != 0) {
            this.netprocsbInterval = setInterval(() => {
              this.computeInterval('netprocsb', this.container.netprocsb.step, this.getNetprocsbChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getStoprocrbChart() {
      let str1
      if (this.filter == 'total') {
        str1 = 'round(sum(bocloud_hmc_proc_vios_storage_rb{parentUuid="' + this.detailUuid + '"}))'
      } else {
        str1 = 'round(bocloud_hmc_proc_vios_storage_rb{parentUuid="' + this.detailUuid + '",instanceUuid="' + this.filter + '"})'
      }
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.container.stoprocrb.stepValue,
        start: this.container.stoprocrb.start,
        end: this.container.stoprocrb.end,
        expr: expr,
        name: '["$instanceUuid"]',
        unit: 'KB/s'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.stoprocrb = Object.assign({}, data.data)
          if (this.stoprocrbInterval) {
            clearInterval(this.stoprocrbInterval)
            this.stoprocrbInterval = ''
          }
          if (this.container.stoprocrb.step != 0) {
            this.stoprocrbInterval = setInterval(() => {
              this.computeInterval('stoprocrb', this.container.stoprocrb.step, this.getStoprocrbChart)
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
          case 'cpu':
            this.cpuDefindTime = value
            this.getCpuChart()
            break
          case 'memory':
            this.memoryDefindTime = value
            this.getMemoryChart()
            break
          case 'netprocsb':
            this.netprocsbDefindTime = value
            this.getNetprocsbChart()
            break
          case 'stoprocrb':
            this.stoprocrbDefindTime = value
            this.getStoprocrbChart()
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
        case 'netprocsb':
          this.userDefindTime = this.netprocsbDefindTime
          break
        case 'stoprocrb':
          this.userDefindTime = this.stoprocrbDefindTime
          break
      }
      this.userDefindVisible = true
    }
  },
  created() {
    this.getFilter()
    this.changeInterval('1H', 'cpu')
    this.changeInterval('1H', 'memory')
    this.changeInterval('1H', 'netprocsb')
    this.changeInterval('1H', 'stoprocrb')
  }
}
</script>
<style scoped></style>
