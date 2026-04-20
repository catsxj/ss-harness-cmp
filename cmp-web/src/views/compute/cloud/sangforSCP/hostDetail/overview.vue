<template>
  <div>
    <detail-map :detail="detailData" :list="detailMapList"></detail-map>
    <el-row :gutter="5">
      <el-col :span="12">
        <el-card class="box-card m-t-xs" style="height: 289px">
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
        <chart-box :params-data="chart" :item-data="paramsOverviewChart[chart.value]"></chart-box>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import detailMap from 'views/components/detailMap.vue'
import { getCharts, getHostDashboard, getHostDetail } from 'services/monitor'
import chartBox from 'views/components/chartBox.vue'
export default {
  components: {
    detailMap,
    chartBox
  },
  props: {
    detailId: {
      type: Number
    },
    detailUuid: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        {
          title: 'CPU利用率',
          value: 'cpu',
          expr: JSON.stringify(['round(sangfor_Host_cpu_usage_average{instanceId="' + this.detailUuid + '"}, 0.01)']),
          name: '["cpu利用率"]',
          unit: '%'
        },
        {
          title: '内存利用率',
          value: 'mem',
          expr: JSON.stringify(['round(sangfor_Host_mem_usage_average{instanceId="' + this.detailUuid + '"}, 0.01)']),
          name: "['内存利用率']",
          unit: '%'
        },
        { title: 'IO读次数', value: 'iops_read', expr: JSON.stringify(['round(sangfor_Host_disk_iops_read{instanceId="' + this.detailUuid + '"},0.01)']), name: "['IO读次数']", unit: '次/s' },
        { title: 'IO写次数', value: 'iops_write', expr: JSON.stringify(['round(sangfor_Host_disk_iops_write{instanceId="' + this.detailUuid + '"},0.01)']), name: "['IO写次数']", unit: '次/s' },
        { title: 'IO读速率', value: 'speed_read', expr: JSON.stringify(['round(sangfor_Host_disk_speed_read{instanceId="' + this.detailUuid + '"},0.01)']), name: "['IO读速率']", unit: 'KB/s' },
        { title: 'IO写速率', value: 'speed_write', expr: JSON.stringify(['round(sangfor_Host_disk_speed_write{instanceId="' + this.detailUuid + '"},0.01)']), name: "['IO写速率']", unit: 'KB/s' },
        {
          title: '包接收流速',
          value: 'received',
          expr: JSON.stringify(['sangfor_Host_net_received_average{instanceId="' + this.detailUuid + '"}']),
          name: '["包接收流速"]',
          unit: 'KB/s'
        },
        {
          title: '包发送流速',
          value: 'transmitted',
          expr: JSON.stringify(['sangfor_Host_net_transmitted_average{instanceId="' + this.detailUuid + '"}']),
          name: '["包发送流速"]',
          unit: 'KB/s'
        }
      ],
      detailData: {},
      detailMapList: [
        { name: 'IP', value: 'ip', unit: '' },
        { name: '总CPU', value: 'cpuCapacity', unit: 'MHz', img: '/web-common-resource/img/detail/cpu.png' },
        { name: '总内存', value: 'memoryCapacity', unit: 'GB', img: '/web-common-resource/img/detail/memorys.png' },
        { name: '总磁盘', value: 'diskCapacity', unit: 'GB', img: '/web-common-resource/img/detail/disks.png' },
        { name: '云主机', value: 'vmNum', unit: '台', img: '/web-common-resource/img/detail/vms.png' }
      ],
      dashboardData: {},
      paramsOverviewChart: {
        cpu: {},
        mem: {},
        iops_read: {},
        iops_write: {},
        speed_read: {},
        speed_write: {},
        received: {},
        transmitted: {}
      },
      userDefindTime: [],
      userDefindVisible: false,
      timeIntervalDashboard: ''
    }
  },
  methods: {
    getDetail() {
      getHostDetail(this.detailId, 'SANGFOR').then((data) => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
        }
      })
    },
    getDashboard() {
      const expr1 = 'round(sangfor_Host_cpu_usage_average{instanceId="' + this.detailUuid + '"},0.01)'
      const expr2 = 'round(sangfor_Host_mem_usage_average{instanceId="' + this.detailUuid + '"},0.01)'
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
    this.getDetail()
    this.getDashboard()
    for (const key in this.paramsOverviewChart) {
      const element = this.paramsOverviewChart[key]
      this.$set(element, 'step', null)
      this.$set(element, 'stepValue', 20)
      this.$set(element, 'defindTime', [])
    }
  }
}
</script>
