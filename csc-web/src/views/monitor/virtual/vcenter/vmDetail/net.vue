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
                <el-button size="mini" :type="item.value == net[chart.value].step ? 'primary' : ''" v-for="item in intervalData" :key="item.value" @click="changeInterval(item.value, chart.value)">{{ item.name }}</el-button>
                <el-button size="mini" :type="net[chart.value].step === 0 ? 'primary' : ''" @click="userDefind(chart.value)">自定义</el-button>
              </el-button-group>
            </span>
          </div>
          <div>
            <line-charts height="220px" width="100%" :id="chart.value + 'Net'" :data="dashboradData[chart.value]" :unit="dashboradData[chart.value].unit" v-if="dashboradData[chart.value]"></line-charts>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <user-defind v-if="userDefindVisible" :user-defind-visible="userDefindVisible" :user-defind-time="userDefindTime" @getData="getOverviewChart"></user-defind>
  </div>
</template>
<script>
import userDefind from '../../userDefind.vue'
import { getCharts } from 'services/monitor'
const intervalData = [
  { name: '1H', value: '1H' },
  { name: '6H', value: '6H' },
  { name: '1D', value: '1D' },
  { name: '7D', value: '7D' },
  { name: '14D', value: '14D' }
]
const typeData = [
  { name: '网络数据接收/传输速率', value: 'netspace' },
  { name: '网络已收到/已传输的数据包数', value: 'packets' },
  { name: '网络使用速率', value: 'usage' }
]
export default {
  components: { userDefind },
  props: {
    detailId: {
      type: Number
    },
    identifier: {
      type: String
    },
    hostName: {
      type: String
    }
  },
  data() {
    return {
      intervalData,
      typeData,
      dashboradData: {
        netspace: null,
        packets: null,
        usage: null
      },
      net: {
        netspace: {},
        packets: {},
        usage: {}
      },
      chartType: '',
      userDefindVisible: false,
      userDefindTime: [],
      netspaceDefindTime: [],
      packetsDefindTime: [],
      usageDefindTime: [],
      netspaceTimeInterval: '',
      packetsTimeInterval: '',
      usageTimeInterval: ''
    }
  },
  methods: {
    computeInterval(type, value, callback) {
      this.net[type].end = Math.round(new Date().getTime() / 1000)
      switch (value) {
        case '1H':
          this.net[type].start = this.net[type].end - 3600
          break
        case '6H':
          this.net[type].start = this.net[type].end - 6 * 3600
          break
        case '1D':
          this.net[type].start = this.net[type].end - 24 * 3600
          break
        case '7D':
          this.net[type].start = this.net[type].end - 7 * 24 * 3600
          break
        case '14D':
          this.net[type].start = this.net[type].end - 14 * 24 * 3600
          break
        default:
          break
      }
      if (value) {
        const duration = this.net[type].end - this.net[type].start
        this.net[type].stepValue = duration / 180 - ((duration / 180) % 20)
        callback()
      }
    },
    // 改变申请概览周期
    changeInterval(value, type) {
      this.chartType = type
      this.net[type].step = value
      switch (type) {
        case 'netspace':
          this.computeInterval(type, value, this.getNetspaceChart)
          break
        case 'packets':
          this.computeInterval(type, value, this.getPacketsChart)
          break
        case 'usage':
          this.computeInterval(type, value, this.getUsageChart)
          break
      }
    },
    getNetspaceChart() {
      const str1 = 'round(vsphere_vm_net_received_average{interface="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"},0.01)'
      const str2 = 'round(vsphere_vm_net_transmitted_average{interface="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"},0.01)'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.net.netspace.stepValue,
        start: this.net.netspace.start,
        end: this.net.netspace.end,
        expr: expr,
        name: '["网络数据接收速率", "网络数据传输速率"]',
        unit: 'KB/s'
      }).then(data => {
        if (data.success) {
          this.dashboradData.netspace = Object.assign({}, data.data)
          if (this.netspaceTimeInterval) {
            clearInterval(this.netspaceTimeInterval)
            this.netspaceTimeInterval = ''
          }
          if (this.net.netspace.step != 0) {
            this.netspaceTimeInterval = setInterval(() => {
              this.computeInterval('netspace', this.net.netspace.step, this.getNetspaceChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getPacketsChart() {
      const str1 = 'vsphere_vm_net_packetsRx_summation{interface="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"}'
      const str2 = 'vsphere_vm_net_packetsTx_summation{interface="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"}'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.net.packets.stepValue,
        start: this.net.packets.start,
        end: this.net.packets.end,
        expr: expr,
        name: '["网络已收到的数据包数", "网络已传输的数据包数"]',
        unit: '个'
      }).then(data => {
        if (data.success) {
          this.dashboradData.packets = Object.assign({}, data.data)
          if (this.packetsTimeInterval) {
            clearInterval(this.packetsTimeInterval)
            this.packetsTimeInterval = ''
          }
          if (this.net.packets.step != 0) {
            this.packetsTimeInterval = setInterval(() => {
              this.computeInterval('packets', this.net.packets.step, this.getPacketsChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getUsageChart() {
      const expr = JSON.stringify(['round(vsphere_vm_net_usage_average{interface="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"},0.01)'])
      getCharts({
        step: this.net.usage.stepValue,
        start: this.net.usage.start,
        end: this.net.usage.end,
        expr: expr,
        name: '["网络使用速率"]',
        unit: 'KB/s'
      }).then(data => {
        if (data.success) {
          this.dashboradData.usage = Object.assign({}, data.data)
          if (this.usageTimeInterval) {
            clearInterval(this.usageTimeInterval)
            this.usageTimeInterval = ''
          }
          if (this.net.usage.step != 0) {
            this.usageTimeInterval = setInterval(() => {
              this.computeInterval('usage', this.net.usage.step, this.getUsageChart)
            }, 60 * 1000)
          }
        }
      })
    },
    getOverviewChart(value) {
      this.userDefindVisible = false
      if (value) {
        this.net[this.chartType].step = 0
        this.net[this.chartType].start = Math.round(value[0] / 1000)
        this.net[this.chartType].end = Math.round(value[1] / 1000)
        const duration = this.net[this.chartType].end - this.net[this.chartType].start
        this.net[this.chartType].stepValue = duration / 180 - ((duration / 180) % 20)
        switch (this.chartType) {
          case 'netspace':
            this.netspaceDefindTime = value
            this.getNetspaceChart()
            break
          case 'packets':
            this.packetsDefindTime = value
            this.getPacketsChart()
            break
          case 'usage':
            this.usageDefindTime = value
            this.getUsageChart()
            break
        }
      }
    },
    userDefind(type) {
      this.chartType = type
      switch (type) {
        case 'netspace':
          this.userDefindTime = this.netspaceDefindTime
          break
        case 'packets':
          this.userDefindTime = this.packetsDefindTime
          break
        case 'usage':
          this.userDefindTime = this.usageDefindTime
          break
      }
      this.userDefindVisible = true
    }
  },
  created() {
    this.changeInterval('1H', 'netspace')
    this.changeInterval('1H', 'packets')
    this.changeInterval('1H', 'usage')
  },
  beforeDestroy() {
    clearInterval(this.netspaceTimeInterval)
    clearInterval(this.packetsTimeInterval)
    clearInterval(this.usageTimeInterval)
  }
}
</script>
