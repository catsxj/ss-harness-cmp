<template>
  <div>
    <detail-map :detail="detailData" :list="detailMapList"></detail-map>
    <el-row :gutter="5">
      <el-col :span="12">
        <el-card class="box-card m-t-xs" style="height:289px;">
          <div slot="header" class="clearfix">
            <span>使用情况</span>
          </div>
          <div class="text-center">
            <el-col :span="12">
              <div>CPU利用率</div>
              <gauge-charts v-if="dashboardData.cpuUsage1" height="190px" id="cpuUsage" width="100%"
                            :data="dashboardData.cpuUsage1"></gauge-charts>
            </el-col>
            <el-col :span="12">
              <div>内存利用率</div>
              <gauge-charts v-if="dashboardData.memUsage1" height="190px" id="memUsage" width="100%"
                            :data="dashboardData.memUsage1"></gauge-charts>
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
import { getCharts, getHostDashboard, getFcHostOverview } from 'services/monitor'
import chartBox from 'views/components/chartBox.vue'
export default {
  components: {
    detailMap, chartBox
  },
  props: {
    detailId: {
      type: Number
    },
    detailName: {
      type: String
    },
    detail: {
      type: Object
    }
  },
  data () {
    return {
      typeData: [
        {
          title: 'CPU利用率',
          value: 'cpu',
          // expr: JSON.stringify(['round(vsphere_host_cpu_usage_average{cpu="instance-total",esxhostname="' + this.detailName + '"}, 0.01)']),
          expr: JSON.stringify(['round(bocloud_fusionsphere_host_cpu_usage{vendorId="' + this.detail.vendorId + '",instance_id="' + this.detail.uuid + '"}, 0.01)']),
          name: '["cpu利用率"]',
          unit: '%'
        },
        {
          title: '磁盘利用率',
          value: 'disk',
          // expr: JSON.stringify(['round(vsphere_host_disk_usage_average{esxhostname="' + this.detailName + '"},0.01)']),
          expr: JSON.stringify(['round(bocloud_fusionsphere_host_logic_disk_usage{vendorId="' + this.detail.vendorId + '",instance_id="' + this.detail.uuid + '"},0.01)']),
          name: "['磁盘利用率']",
          unit: '%'
        },
        {
          title: '内存利用率',
          value: 'mem',
          // expr: JSON.stringify(['round(vsphere_host_mem_usage_average{esxhostname="' + this.detailName + '"}, 0.01)']),
          expr: JSON.stringify(['round(bocloud_fusionsphere_host_mem_usage{vendorId="' + this.detail.vendorId + '",instance_id="' + this.detail.uuid + '"}, 0.01)']),
          name: "['内存利用率']",
          unit: '%'
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
        disk: {},
        mem: {}
      },
      userDefindTime: [],
      userDefindVisible: false,
      timeIntervalDashboard: ''
    }
  },
  methods: {
    getDetail () {
      getFcHostOverview(this.detailId).then(data => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data);
        }
      })
    },
    getDashboard () {
      // const expr1 = 'round(vsphere_host_cpu_usage_average{cpu="instance-total",source="' + this.detailName + '"},0.01)'
      const expr1 = 'round(bocloud_fusionsphere_host_cpu_usage{vendorId="' + this.detail.vendorId + '",instance_id="' + this.detail.uuid + '"},0.01)'
      // const expr2 = 'round(vsphere_host_mem_usage_average{source="' + this.detailName + '"},0.01)'
      const expr2 = 'round(bocloud_fusionsphere_host_mem_usage{vendorId="' + this.detail.vendorId + '",instance_id="' + this.detail.uuid + '"},0.01)'
      getHostDashboard({
        expr: expr1,
        simple: true
      }).then(data => {
        if (data.success) {
          this.$set(this.dashboardData, 'cpuUsage1', {
            name: 'CPU利用率',
            data: { value: data.data, name: '%' },
            min: 0,
            max: 100
          });
        }
      })
      getHostDashboard({
        expr: expr2,
        simple: true
      }).then(data => {
        if (data.success) {
          this.$set(this.dashboardData, 'memUsage1', {
            name: '内存利用率',
            data: { value: data.data, name: '%' },
            min: 0,
            max: 100
          });
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
  created () {
    this.getDetail();
    this.getDashboard();
    for (const key in this.paramsOverviewChart) {
      const element = this.paramsOverviewChart[key];
      this.$set(element, 'step', null)
      this.$set(element, 'stepValue', 20)
      this.$set(element, 'defindTime', [])
    }
  }
}
</script>
