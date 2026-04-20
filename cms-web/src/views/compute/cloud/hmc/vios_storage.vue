<template>
  <div>
    <el-row :gutter="5">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <el-card class="box-card m-t-xs">
          <div slot="header" class="clearfix">
            <span class="pull-left m-r-xs">
              {{ chart.name }}
            </span>
            <el-select class="pull-left" style="width: 90px" filterable v-model="container[chart.value].filter" placeholder="请选择" @change="changeFilter">
              <el-option label="总计" value="total"></el-option>
              <el-option v-for="item in container[chart.value].filterData" :key="item" :label="item" :value="item"></el-option>
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
  { name: '存储实时读取速率', value: 'stoprocrb' },
  { name: '存储实时写入速率', value: 'stoprocwb' },
  { name: '存储累计读取量', value: 'stoltmrb' },
  { name: '存储累计写入量', value: 'stoltmwb' }
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
      filterData: [],
      dashboradData: {
        stoprocrb: null,
        stoprocwb: null,
        stoltmrb: null,
        stoltmwb: null
      },
      container: {
        stoprocrb: {},
        stoprocwb: {},
        stoltmrb: {},
        stoltmwb: {}
      },
      chartType: '',
      userDefindVisible: false,
      userDefindTime: [],
      stoprocrbDefindTime: [],
      stoprocwbDefindTime: [],
      stoltmrbDefindTime: [],
      stoltmwbDefindTime: [],
      stoprocrbInterval: '',
      stoprocwbInterval: '',
      stoltmrbInterval: '',
      stoltmwbInterval: ''
    }
  },
  beforeDestroy() {
    clearInterval(this.stoprocrbInterval)
    clearInterval(this.stoprocwbInterval)
    clearInterval(this.stoltmrbInterval)
    clearInterval(this.stoltmwbInterval)
  },
  methods: {
    getFilter() {
      const params1 = {
        expr: `bocloud_hmc_proc_vios_storage_rb{parentUuid="${this.detailUuid}"}`,
        filter: 'instanceUuid'
      }
      const params2 = {
        expr: `bocloud_hmc_proc_vios_storage_wb{parentUuid="${this.detailUuid}"}`,
        filter: 'instanceUuid'
      }
      const params3 = {
        expr: `bocloud_hmc_ltm_vios_storage_rb{parentUuid="${this.detailUuid}"}`,
        filter: 'instanceName'
      }
      const params4 = {
        expr: `bocloud_hmc_ltm_vios_storage_wb{parentUuid="${this.detailUuid}"}`,
        filter: 'instanceName'
      }
      getfilters(params1).then((data) => {
        if (data.success) {
          this.container.stoprocrb.filterData = data.data
        }
      })
      getfilters(params2).then((data) => {
        if (data.success) {
          this.container.stoprocwb.filterData = data.data
        }
      })
      getfilters(params3).then((data) => {
        if (data.success) {
          this.container.stoltmrb.filterData = data.data
        }
      })
      getfilters(params4).then((data) => {
        if (data.success) {
          this.container.stoltmwb.filterData = data.data
        }
      })
    },
    changeFilter(value) {
      for (const key in this.container) {
        const element = this.container[key]
        if (element.filter == value) {
          this.changeInterval(this.container[key].step, key)
        }
      }
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
        case 'stoprocrb':
          this.computeInterval(type, value, this.getStoprocrbChart)
          break
        case 'stoprocwb':
          this.computeInterval(type, value, this.getStoprocwbChart)
          break
        case 'stoltmrb':
          this.computeInterval(type, value, this.getStoltmrbChart)
          break
        case 'stoltmwb':
          this.computeInterval(type, value, this.getStoltmwbChart)
          break
      }
    },
    getStoprocrbChart() {
      let str1
      let name
      if (this.container.stoprocrb.filter == 'total') {
        str1 = 'round(sum(bocloud_hmc_proc_vios_storage_rb{parentUuid="' + this.detailUuid + '"}))'
        name = "['总计']"
      } else {
        str1 = 'round(bocloud_hmc_proc_vios_storage_rb{parentUuid="' + this.detailUuid + '",instanceUuid="' + this.container.stoprocrb.filter + '"})'
        name = "['$instanceUuid']"
      }
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.container.stoprocrb.stepValue,
        start: this.container.stoprocrb.start,
        end: this.container.stoprocrb.end,
        expr: expr,
        name: name,
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
    getStoprocwbChart() {
      let str1 = ''
      let name = ''
      if (this.container.stoprocwb.filter == 'total') {
        str1 = 'round(sum(bocloud_hmc_proc_vios_storage_wb{parentUuid="' + this.detailUuid + '"}))'
        name = "['总计']"
      } else {
        str1 = 'round(bocloud_hmc_proc_vios_storage_wb{parentUuid="' + this.detailUuid + '",instanceUuid="' + this.container.stoprocwb.filter + '"})'
        name = "['$instanceUuid']"
      }
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.container.stoprocwb.stepValue,
        start: this.container.stoprocwb.start,
        end: this.container.stoprocwb.end,
        expr: expr,
        name: name,
        unit: 'KB/s'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.stoprocwb = Object.assign({}, data.data)
          if (this.stoprocwbInterval) {
            clearInterval(this.stoprocwbInterval)
            this.stoprocwbInterval = ''
          }
          if (this.container.stoprocwb.step != 0) {
            this.stoprocwbInterval = setInterval(() => {
              this.computeInterval('stoprocwb', this.container.stoprocwb.step, this.getStoprocwbChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getStoltmrbChart() {
      let str1 = ''
      let name = ''
      if (this.container.stoltmrb.filter == 'total') {
        str1 = 'round(sum(bocloud_hmc_ltm_vios_storage_rb{parentUuid="' + this.detailUuid + '"}) /1024,0.01)'
        name = "['总计']"
      } else {
        str1 = 'round(bocloud_hmc_ltm_vios_storage_rb{parentUuid="' + this.detailUuid + '",instanceName="' + this.container.stoltmrb.filter + '"} /1024,0.01)'
        name = "['$instanceName']"
      }
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.container.stoltmrb.stepValue,
        start: this.container.stoltmrb.start,
        end: this.container.stoltmrb.end,
        expr: expr,
        name: name,
        unit: 'MB'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.stoltmrb = Object.assign({}, data.data)
          if (this.stoltmrbInterval) {
            clearInterval(this.stoltmrbInterval)
            this.stoltmrbInterval = ''
          }
          if (this.container.stoltmrb.step != 0) {
            this.stoltmrbInterval = setInterval(() => {
              this.computeInterval('stoltmrb', this.container.stoltmrb.step, this.getStoltmrbChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getStoltmwbChart() {
      let str1 = ''
      let name = ''
      if (this.container.stoltmwb.filter == 'total') {
        str1 = 'round(sum(bocloud_hmc_ltm_vios_storage_wb{parentUuid="' + this.detailUuid + '"}) /1024,0.01)'
        name = "['总计']"
      } else {
        str1 = 'round(bocloud_hmc_ltm_vios_storage_wb{parentUuid="' + this.detailUuid + '",instanceName="' + this.container.stoltmwb.filter + '"} /1024,0.01)'
        name = "['$instanceName']"
      }
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.container.stoltmwb.stepValue,
        start: this.container.stoltmwb.start,
        end: this.container.stoltmwb.end,
        expr: expr,
        name: name,
        unit: 'MB'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.stoltmwb = Object.assign({}, data.data)
          if (this.stoltmwbInterval) {
            clearInterval(this.stoltmwbInterval)
            this.stoltmwbInterval = ''
          }
          if (this.container.stoltmwb.step != 0) {
            this.stoltmwbInterval = setInterval(() => {
              this.computeInterval('stoltmwb', this.container.stoltmwb.step, this.getStoltmwbChart)
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
          case 'stoprocrb':
            this.stoprocrbDefindTime = value
            this.getStoprocrbChart()
            break
          case 'stoprocwb':
            this.stoprocwbDefindTime = value
            this.getStoprocwbChart()
            break
          case 'stoltmrb':
            this.stoltmrbDefindTime = value
            this.getStoltmrbChart()
            break
          case 'stoltmwb':
            this.stoltmwbDefindTime = value
            this.getStoltmwbChart()
            break
        }
      }
    },
    userDefind(type) {
      this.chartType = type
      switch (type) {
        case 'stoprocrb':
          this.userDefindTime = this.stoprocrbDefindTime
          break
        case 'stoprocwb':
          this.userDefindTime = this.stoprocwbDefindTime
          break
        case 'stoltmrb':
          this.userDefindTime = this.stoltmrbDefindTime
          break
        case 'stoltmwb':
          this.userDefindTime = this.stoltmwbDefindTime
          break
      }
      this.userDefindVisible = true
    }
  },
  created() {
    for (const key in this.container) {
      const element = this.container[key]
      this.$set(element, 'filter', 'total')
    }
    this.getFilter()
    this.changeInterval('1H', 'stoprocrb')
    this.changeInterval('1H', 'stoprocwb')
    this.changeInterval('1H', 'stoltmrb')
    this.changeInterval('1H', 'stoltmwb')
  }
}
</script>
<style scoped></style>
