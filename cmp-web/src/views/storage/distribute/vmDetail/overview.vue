<template>
  <div>
    <detail-map :detail="detailData" :list="detailMapList"></detail-map>
    <el-row :gutter="20">
      <el-col :span="24">
        <el-col :span="12">
          <el-card class="box-card m-t">
            <div slot="header" class="clearfix">
              <span>使用情况</span>
            </div>
            <div class="text-center">
              <el-row :gutter="20">
                <el-col :span="12">
                  <div>CPU利用率</div>
                  <gauge-charts v-if="dashboardData.cpuUsage1" height="200px" id="cpuUsage" width="100%" :data="dashboardData.cpuUsage1"></gauge-charts>
                </el-col>
                <el-col :span="12">
                  <div>内存利用率</div>
                  <gauge-charts v-if="dashboardData.memUsage1" height="200px" id="memUsage" width="100%" :data="dashboardData.memUsage1"></gauge-charts>
                </el-col>
              </el-row>
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
import detailMap from '../detailMap'
import { getHostDashboard, getVmOverview } from 'services/monitor'
export default {
  components: {
    chartBox,
    detailMap
  },
  props: {
    detailId: {
      type: Number
    },
    identifier: {
      type: String
    },
    address: {
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
          expr: JSON.stringify(['vsphere_vm_cpu_usage_average{cpu="instance-total",vmname="' + this.identifier + '",vcenter="' + this.address + '"}']),
          name: '["CPU利用率"]',
          unit: '%'
        },
        {
          title: '磁盘使用速率',
          value: 'disk',
          expr: JSON.stringify(['vsphere_vm_disk_usage_average{disk="instance-total",vmname="' + this.identifier + '",vcenter="' + this.address + '"}']),
          name: '["磁盘使用速率"]',
          unit: 'KB/s'
        },
        {
          title: '内存利用率',
          value: 'mem',
          expr: JSON.stringify(['vsphere_vm_mem_usage_average{vmname="' + this.identifier + '",vcenter="' + this.address + '"}']),
          name: '["内存利用率"]',
          unit: '%'
        }
      ],
      dashboardDataChart: {
        cpu: {},
        disk: {},
        mem: {}
      },
      detailData: {},
      detailMapList: [
        { name: '名称', value: 'name', unit: '' },
        { name: 'IP', value: 'ip', unit: '' }
      ],
      dashboardData: {},
      timeIntervalDashboard: ''
    }
  },
  methods: {
    getDetail() {
      getVmOverview(this.detailId).then((data) => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
        }
      })
    },
    getDashboard() {
      const expr1 = 'round(vsphere_vm_cpu_usage_average{cpu="instance-total",vmname="' + this.identifier + '",vcenter="' + this.address + '"},0.01)'
      const expr2 = 'round(vsphere_vm_mem_usage_average{vmname="' + this.identifier + '",vcenter="' + this.address + '"},0.01)'
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
