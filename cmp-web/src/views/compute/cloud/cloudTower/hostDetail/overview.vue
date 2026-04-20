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
            <el-col :span="12">
              <div>IOPS-总</div>
              <gauge-charts v-if="dashboardData.iopsUsage1" height="190px" id="iopsUsage1" width="100%" :data="dashboardData.iopsUsage1"></gauge-charts>
            </el-col>
            <el-col :span="12">
              <div>I/O带宽总</div>
              <gauge-charts v-if="dashboardData.ioUsage1" height="190px" id="ioUsage1" width="100%" :data="dashboardData.ioUsage1"></gauge-charts>
            </el-col>
            <el-col :span="12">
              <div>磁盘利用率</div>
              <gauge-charts v-if="dashboardData.diskUsage1" height="190px" id="diskUsage1" width="100%" :data="dashboardData.diskUsage1"></gauge-charts>
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
    detailName: {
      type: String
    },
    uuid: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        {
          title: 'CPU利用率',
          value: 'cpu',
          expr: JSON.stringify(['round(bocloud_cloudtower_host_host_cpu_overall_usage_percent{instanceId="' + this.uuid + '"}, 0.01)']),
          name: '["cpu利用率"]',
          unit: '%'
        },
        {
          title: '内存利用率',
          value: 'mem',
          expr: JSON.stringify(['round(bocloud_cloudtower_host_host_memory_usage_percent{instanceId="' + this.uuid + '"}, 0.01)']),
          name: "['内存利用率']",
          unit: '%'
        },
        {
          title: 'IOPS-总',
          value: 'iops',
          expr: JSON.stringify(['round(bocloud_cloudtower_host_zbs_chunk_readwrite_iops{instanceId="' + this.uuid + '"}, 0.01)']),
          name: "['IOPS-总']",
          unit: 'IOPS'
        },
        {
          title: 'I/O带宽总',
          value: 'io',
          expr: JSON.stringify(['round(bocloud_cloudtower_host_zbs_chunk_readwrite_speed_bps{instanceId="' + this.uuid + '"}, 0.01)']),
          name: "['I/O带宽总']",
          unit: 'I/O'
        },
        {
          title: '磁盘利用率',
          value: 'disk',
          expr: JSON.stringify(['round(bocloud_cloudtower_host_host_storage_usage_percent{instanceId="' + this.uuid + '"}, 0.01)']),
          name: "['磁盘利用率']",
          unit: '%'
        },
        { title: '磁盘读取速率', value: 'read', expr: JSON.stringify(['round(bocloud_cloudtower_host_zbs_chunk_read_iops{instanceId="' + this.uuid + '"}, 0.01)']), name: "['磁盘读取速率']", unit: 'Bps' }
      ],
      detailData: {},
      detailMapList: [
        { name: 'IP', value: 'ip', unit: '' },
        { name: '总CPU', value: 'cpuCapacity', unit: 'MHz', img: '/web-common-resource/img/detail/cpu.png' },
        { name: '总内存', value: 'memoryCapacity', unit: 'GB', img: '/web-common-resource/img/detail/memorys.png' },
        { name: '云主机', value: 'vmNum', unit: '台', img: '/web-common-resource/img/detail/vms.png' }
      ],
      dashboardData: {},
      paramsOverviewChart: {
        cpu: {},
        mem: {},
        iops: {},
        io: {},
        disk: {},
        read: {},
        write: {}
      },
      userDefindTime: [],
      userDefindVisible: false,
      timeIntervalDashboard: ''
    }
  },
  methods: {
    getDetail() {
      getHostDetail(this.detailId, 'CLOUDTOWER').then((data) => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
        }
      })
    },
    getDashboard() {
      const expr1 = 'round(bocloud_cloudtower_host_host_cpu_overall_usage_percent{id="' + this.detailId + '"}, 0.01)'
      const expr2 = 'round(bocloud_cloudtower_host_host_memory_usage_percent{id="' + this.detailId + '"}, 0.01)'
      const expr3 = 'round(bocloud_cloudtower_host_zbs_chunk_readwrite_iops{id="' + this.detailId + '"}, 0.01)'
      const expr4 = 'round(bocloud_cloudtower_host_zbs_chunk_readwrite_speed_bps{id="' + this.detailId + '"}, 0.01)'
      const expr5 = 'round(bocloud_cloudtower_host_host_storage_usage_percent{id="' + this.detailId + '"}, 0.01)'
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
      getHostDashboard({
        expr: expr3,
        simple: true
      }).then((data) => {
        if (data.success) {
          this.$set(this.dashboardData, 'iopsUsage1', {
            name: 'IOPS-总',
            data: { value: data.data, name: '%' },
            min: 0,
            max: 100
          })
        }
      })
      getHostDashboard({
        expr: expr4,
        simple: true
      }).then((data) => {
        if (data.success) {
          this.$set(this.dashboardData, 'ioUsage1', {
            name: 'I/O带宽总',
            data: { value: data.data, name: '%' },
            min: 0,
            max: 100
          })
        }
      })
      getHostDashboard({
        expr: expr5,
        simple: true
      }).then((data) => {
        if (data.success) {
          this.$set(this.dashboardData, 'diskUsage1', {
            name: '磁盘利用率',
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
