<template>
  <div>
    <el-row :gutter="5">
      <el-col :span="12" v-for="(chart, index) in typeData" :key="chart.value">
        <el-card class="box-card m-t-xs">
          <div slot="header" class="clearfix">
            <span>
              {{ chart.name }}
            </span>
            <el-select style="width: 21%" v-if="index == 2" v-model="instanceName" placeholder="请选择" @change="changePool">
              <el-option v-for="item in poolData" :key="item" :label="item" :value="item"> </el-option>
            </el-select>
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
import userDefind from 'views/components/userDefind.vue'
import { getCharts, getPoolDatas } from 'services/monitor'
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
  { name: '共享处理器池', value: 'pool' }
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
        cpu: null,
        memory: null,
        pool: null
      },
      container: {
        cpu: {},
        memory: {},
        pool: {}
      },
      chartType: '',
      userDefindVisible: false,
      userDefindTime: [],
      cpuDefindTime: [],
      memoryDefindTime: [],
      poolDefindTime: [],
      cpuInterval: '',
      memoryInterval: '',
      poolInterval: '',
      poolData: [],
      instanceName: null
    }
  },
  beforeDestroy() {
    clearInterval(this.memoryInterval)
    clearInterval(this.poolInterval)
    clearInterval(this.cpuInterval)
  },
  methods: {
    getPoolData() {
      getPoolDatas({
        expr: 'bocloud_hmc_proc_server_share_cpu_pool_assigned{parentUuid="' + this.detailUuid + '"}',
        filter: 'instanceName'
      }).then((data) => {
        if (data.success) {
          this.poolData = data.data
          this.instanceName = this.poolData[0]
          this.changeInterval('1H', 'pool')
        }
      })
    },
    changePool(value) {
      this.getPoolChart()
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
        case 'pool':
          this.computeInterval(type, value, this.getPoolChart)
          break
      }
    },
    getCpuChart() {
      const str1 = 'round(bocloud_hmc_proc_server_cpu_total{instanceUuid = "' + this.detailUuid + '"}, 0.01)'
      const str2 = 'round(bocloud_hmc_proc_server_cpu_used{instanceUuid = "' + this.detailUuid + '"}, 0.01)'
      const str3 = 'round(bocloud_hmc_proc_server_cpu_utilized{instanceUuid = "' + this.detailUuid + '"}, 0.01)'
      const expr = JSON.stringify([str1, str2, str3])
      getCharts({
        step: this.container.cpu.stepValue,
        start: this.container.cpu.start,
        end: this.container.cpu.end,
        expr: expr,
        name: "['总量', '已分配', '已使用']",
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
      const str1 = 'bocloud_hmc_proc_server_mem_total{instanceUuid ="' + this.detailUuid + '"} /1024'
      const str2 = 'bocloud_hmc_proc_server_mem_used{instanceUuid ="' + this.detailUuid + '"} /1024'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.container.memory.stepValue,
        start: this.container.memory.start,
        end: this.container.memory.end,
        expr: expr,
        name: '["总量", "已分配"]',
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
    getPoolChart() {
      const str1 = 'bocloud_hmc_proc_server_share_cpu_pool_assigned{instanceName="' + this.instanceName + '",parentUuid = "' + this.detailUuid + '"}'
      const str2 = 'bocloud_hmc_proc_server_share_cpu_pool_configured{instanceName="' + this.instanceName + '",parentUuid = "' + this.detailUuid + '"}'
      const str3 = 'bocloud_hmc_proc_server_share_cpu_pool_utilized{instanceName="' + this.instanceName + '",parentUuid = "' + this.detailUuid + '"}'
      const expr = JSON.stringify([str1, str2, str3])
      getCharts({
        step: this.container.pool.stepValue,
        start: this.container.pool.start,
        end: this.container.pool.end,
        expr: expr,
        name: '["总量", "已分配", "已使用"]',
        unit: '单元'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.pool = Object.assign({}, data.data)
          if (this.poolInterval) {
            clearInterval(this.poolInterval)
            this.poolInterval = ''
          }
          if (this.container.pool.step != 0) {
            this.poolInterval = setInterval(() => {
              this.computeInterval('pool', this.container.pool.step, this.getPoolChart)
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
          case 'pool':
            this.poolDefindTime = value
            this.getPoolChart()
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
        case 'pool':
          this.userDefindTime = this.poolDefindTime
          break
      }
      this.userDefindVisible = true
    }
  },
  created() {
    this.getPoolData()
    this.changeInterval('1H', 'cpu')
    this.changeInterval('1H', 'memory')
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
