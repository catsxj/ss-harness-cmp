<template>
  <div>
    <detail-map :detail="detailData" :list="detailMapList" v-if="isShow"></detail-map>
    <el-row :gutter="5">
      <el-col :span="24">
        <el-col :span="12">
          <el-card class="box-card m-t-xs" style="height: 300px">
            <div slot="header" class="clearfix">
              <span>使用情况</span>
            </div>
            <div class="text-center">
              <el-col :span="12">
                <div>CPU利用率</div>
                <gauge-charts v-if="dashboardData.cpuUsage1" height="190px" id="cpuUsage" width="100%" :data="dashboardData.cpuUsage1"></gauge-charts>
              </el-col>
              <el-col :span="12">
                <div>内存利用率</div>
                <gauge-charts v-if="dashboardData.memUsage1" height="190px" id="memUsage" width="100%" :data="dashboardData.memUsage1"></gauge-charts>
              </el-col>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12" v-for="chart in typeData" :key="chart.value">
          <chart-box :params-data="chart" :item-data="dashboardDataChart[chart.value]"></chart-box>
        </el-col>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import chartBox from 'views/components/chartBox.vue'
import detailMap from 'views/components/detailMap.vue'
import { getHostDashboard } from 'services/monitor'
import { detailVm } from 'services/platform/index'
export default {
  components: {
    chartBox,
    detailMap
  },
  props: {
    detailId: {
      type: Number
    },

    isShow: {
      type: Boolean
    },
    detailUuid: {
      type: String
    }
  },
  beforeDestroy() {
    clearInterval(this.timeIntervalDashboard)
  },
  data() {
    return {
      typeData: [
        {
          title: 'CPU利用率',
          value: 'cpu',
          expr: JSON.stringify(['round(sangfor_cloudServer_cpu_usage_average{instanceId="' + this.detailUuid + '"},0.01)']),
          name: '["CPU利用率"]',
          unit: '%'
        },
        {
          title: '内存利用率',
          value: 'mem',
          expr: JSON.stringify(['round(sangfor_cloudServer_mem_usage_average{instanceId="' + this.detailUuid + '"},0.01)']),
          name: '["内存利用率"]',
          unit: '%'
        },
        {
          title: '包接收流速',
          value: 'received',
          expr: JSON.stringify(['round(sangfor_vm_net_received_average{instanceId="' + this.detailUuid + '"},0.01)']),
          name: '["网络使用速率"]',
          unit: 'KB/s'
        },
        {
          title: '包发送流速',
          value: 'transmitted',
          expr: JSON.stringify(['round(sangfor_vm_net_transmitted_average{instanceId="' + this.detailUuid + '"},0.01)']),
          name: '["网络使用速率"]',
          unit: 'KB/s'
        },
        {
          title: '包接收速率',
          value: 'packetsRx',
          expr: JSON.stringify(['round(sangfor_vm_net_packetsRx_summation{instanceId="' + this.detailUuid + '"},0.01)']),
          name: '["网络使用速率"]',
          unit: '个/s'
        },
        {
          title: '包发送速率',
          value: 'packetsTx',
          expr: JSON.stringify(['round(sangfor_vm_net_packetsTx_summation{instanceId="' + this.detailUuid + '"},0.01)']),
          name: '["网络使用速率"]',
          unit: '个/s'
        },
        {
          title: 'IO读次数',
          value: 'iopsRead',
          expr: JSON.stringify(['round(sangfor_vm_disk_iops_read{instanceId="' + this.detailUuid + '"},0.01)']),
          name: '["IO读次数"]',
          unit: '次/s'
        },
        {
          title: 'IO写次数',
          value: 'iopsWrite',
          expr: JSON.stringify(['round(sangfor_vm_disk_iops_write{instanceId="' + this.detailUuid + '"},0.01)']),
          name: '["IO写次数"]',
          unit: '次/s'
        },
        {
          title: 'IO读速率',
          value: 'speedRead',
          expr: JSON.stringify(['round(sangfor_vm_disk_speed_read{instanceId="' + this.detailUuid + '"},0.01)']),
          name: '["IO读速率"]',
          unit: 'KB/s'
        },
        {
          title: 'IO写速率',
          value: 'speedWrite',
          expr: JSON.stringify(['round(sangfor_vm_disk_speed_write{instanceId="' + this.detailUuid + '"},0.01)']),
          name: '["IO写速率"]',
          unit: 'KB/s'
        }
      ],
      dashboardDataChart: {
        cpu: {},
        mem: {},
        received: {},
        transmitted: {},
        packetsRx: {},
        packetsTx: {},
        iopsRead: {},
        iopsWrite: {},
        speedRead: {},
        speedWrite: {}
      },
      detailData: {},
      detailMapList: [
        // { name: '名称', value: 'name', unit: '' },
        // { name: 'IP', value: 'privateIps', unit: '', type: 'vcenter' },
        { name: '规格', value: 'spec' },
        { name: '创建时间', value: 'gmtCreate', unit: '' },
        { name: '操作系统', value: 'osCategory' }
      ],
      dashboardData: {},
      timeIntervalDashboard: ''
    }
  },
  methods: {
    getDetail() {
      detailVm(this.detailId).then((data) => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
          this.detailData.privateIps = JSON.parse(this.detailData.privateIps)
          this.detailData.spec = (this.detailData.cpu ? this.detailData.cpu : 0) + 'C/' + (this.detailData.memory ? this.detailData.memory : 0) + 'GB/' + (this.detailData.disk == null ? 0 : this.detailData.disk) + 'GB'
        }
      })
    },
    getDashboard() {
      const expr1 = 'round(sangfor_cloudServer_cpu_usage_average{instanceId="' + this.detailUuid + '"},0.01)'
      const expr2 = 'round(sangfor_cloudServer_mem_usage_average{instanceId="' + this.detailUuid + '"},0.01)'
      getHostDashboard({
        expr: expr1,
        simple: true
      }).then((data) => {
        if (data.success) {
          this.$set(this.dashboardData, 'cpuUsage1', {
            name: 'CPU利用率',
            data: { value: data.data, name: '%' },
            min: 0,
            max: 100
          })
        }
      })
      getHostDashboard({
        expr: expr2,
        simple: true
      }).then((data) => {
        if (data.success) {
          this.$set(this.dashboardData, 'memUsage1', {
            name: '内存利用率',
            data: { value: data.data, name: '%' },
            min: 0,
            max: 100
          })
        }
      })
      if (this.timeIntervalDashboard) {
        clearInterval(this.timeIntervalDashboard)
        this.timeIntervalDashboard = ''
      }
      this.timeIntervalDashboard = setInterval(() => {
        this.getDashboard()
      }, 60 * 1000)
    }
  },
  created() {
    for (const key in this.dashboardDataChart) {
      const element = this.dashboardDataChart[key]
      this.$set(element, 'step', null)
      this.$set(element, 'stepValue', 20)
      this.$set(element, 'defindTime', [])
    }
    this.getDetail()
    this.getDashboard()
  }
}
</script>
