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
    identifier: {
      type: String
    },
    hostName: {
      type: String
    },
    isShow: {
      type: Boolean
    },
    instanceId: {
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
          expr: JSON.stringify(['round(bocloud_cloudtower_vm_elf_vm_cpu_overall_usage_percent{instanceId="' + this.instanceId + '"}, 0.01)']),
          name: '["CPU利用率"]',
          unit: '%'
        },
        {
          title: '内存利用率',
          value: 'mem',
          expr: JSON.stringify(['round(bocloud_cloudtower_vm_elf_vm_memory_usage_percent{instanceId="' + this.instanceId + '"}, 0.01)']),
          name: '["内存利用率"]',
          unit: '%'
        },
        {
          title: 'IOPS-总',
          value: 'iops',
          expr: JSON.stringify(['round(bocloud_cloudtower_vm_elf_vm_disk_overall_readwrite_iops{instanceId="' + this.instanceId + '"}, 0.01)']),
          name: "['IOPS-总']",
          unit: 'IOPS'
        },
        {
          title: 'I/O带宽总',
          value: 'io',
          expr: JSON.stringify(['round(bocloud_cloudtower_vm_elf_vm_disk_overall_readwrite_speed_bps{instanceId="' + this.instanceId + '"}, 0.01)']),
          name: "['I/O带宽总']",
          unit: 'I/O'
        },
        {
          title: '磁盘利用率',
          value: 'disk',
          expr: JSON.stringify(['round(bocloud_cloudtower_vm_elf_vm_disk_usage_percent{instanceId="' + this.instanceId + '"}, 0.01)']),
          name: "['磁盘利用率']",
          unit: '%'
        }
      ],
      dashboardDataChart: {
        cpu: {},
        mem: {},
        read: {},
        iops: {},
        io: {},
        disk: {}
      },
      detailData: {},
      detailMapList: [
        // { name: '名称', value: 'name', unit: '' },
        { name: 'IP', value: 'managerIp', unit: '' },
        { name: '规格', value: 'spec' },
        { name: '创建时间', value: 'gmtCreate', unit: '' },
        { name: '操作系统', value: 'osName' }
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
      const expr1 = 'round(bocloud_cloudtower_vm_elf_vm_cpu_overall_usage_percent{id="' + this.detailId + '"}, 0.01)'
      const expr2 = 'round(bocloud_cloudtower_vm_elf_vm_memory_usage_percent{id="' + this.detailId + '"}, 0.01)'
      const expr3 = 'round(bocloud_cloudtower_vm_elf_vm_disk_overall_readwrite_iops{id="' + this.detailId + '"}, 0.01)'
      const expr4 = 'round(bocloud_cloudtower_vm_elf_vm_disk_overall_readwrite_speed_bps{id="' + this.detailId + '"}, 0.01)'
      const expr5 = 'round(bocloud_cloudtower_vm_elf_vm_disk_usage_percent{id="' + this.detailId + '"}, 0.01)'
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
