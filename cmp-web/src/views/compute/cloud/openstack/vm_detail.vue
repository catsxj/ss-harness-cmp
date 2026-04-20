<template>
  <div>
    <detail-map :detail="detailData" :list="detailMapList" v-if="isShow"></detail-map>
    <el-row :gutter="5">
      <el-col :span="12">
        <el-card class="box-card m-t-xs" style="height: 289px">
          <div slot="header" class="clearfix">
            <span>使用情况</span>
          </div>
          <div class="text-center">
            <el-col :span="12">
              <div>CPU利用率</div>
              <gauge-charts v-if="usageData.cpuUsage1" height="190px" id="cpuUsage" width="100%" :data="usageData.cpuUsage1"></gauge-charts>
            </el-col>
            <el-col :span="12">
              <div>内存利用率</div>
              <gauge-charts v-if="usageData.memUsage1" height="190px" id="memUsage" width="100%" :data="usageData.memUsage1"></gauge-charts>
            </el-col>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import chartBox from 'views/components/chartBox.vue'
import { getCharts, getUsage, getOpenstackVm } from 'services/monitor'
import detailMap from 'views/components/detailMap.vue'
export default {
  components: { chartBox, detailMap },
  props: {
    detailId: {
      type: Number
    },
    instanceId: {
      type: String
    },
    isShow: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      typeData: [
        {
          title: 'CPU利用率',
          value: 'first',
          expr: JSON.stringify(['round((avg(irate(libvirt_domain_info_cpu_time_seconds_total{instanceId="' + this.instanceId + '"}[5m])) by (instanceId))*100/ avg(libvirt_domain_info_virtual_cpus) by (instanceId),0.01)']),
          name: '["CPU利用率"]',
          unit: '%'
        },
        {
          title: '内存利用率',
          value: 'second',
          expr: JSON.stringify(['round((1-libvirt_domain_memory_stat_unused/libvirt_domain_memory_stat_available{instanceId="' + this.instanceId + '"})*100,0.01)']),
          name: '["内存利用率"]',
          unit: '%'
        },
        {
          title: '磁盘IOPS',
          value: 'third',
          expr: JSON.stringify(['round(sum(irate(libvirt_domain_block_stats_read_requests_total{instanceId="' + this.instanceId + '"}[5m])) by (instanceId))', 'round(sum(irate(libvirt_domain_block_stats_write_requests_total{instanceId="' + this.instanceId + '"}[5m])) by (instanceId))']),
          name: '["读取","写入"]',
          unit: 'IO/s'
        },
        // {
        //   title: '磁盘IOPS',
        //   value: 'third',
        //   expr: JSON.stringify([
        //     'round(sum(irate(libvirt_domain_block_stats_read_requests_total{instanceId="' + this.instanceId + '"}[5m])) by (instanceId))',
        //     'round(sum(irate(libvirt_domain_block_stats_write_requests_total{instanceId="' + this.instanceId + '"}[5m])) by (instanceId))'
        //   ]),
        //   name: '["读取","写入"]',
        //   unit: 'IO/s'
        // },
        {
          title: '磁盘读写速度',
          value: 'fourth',
          expr: JSON.stringify(['round(sum(irate(libvirt_domain_block_stats_read_bytes_total{instanceId="' + this.instanceId + '"}[5m])) by (instanceId)/1024)', 'round(sum(irate(libvirt_domain_block_stats_write_bytes_total{instanceId="' + this.instanceId + '"}[5m])) by (instanceId)/1024)']),
          name: '["读取","写入"]',
          unit: 'KB/s'
        },
        {
          title: '磁盘读写总量',
          value: 'fifth',
          expr: JSON.stringify(['round(sum(libvirt_domain_block_stats_read_bytes_total{instanceId="' + this.instanceId + '"})/1024)', 'round(sum(libvirt_domain_block_stats_write_bytes_total{instanceId="' + this.instanceId + '"})/1024)']),
          name: '["读取","写入"]',
          unit: 'KB'
        },
        {
          title: '网络传输速度',
          value: 'sixth',
          expr: JSON.stringify(['round(irate(libvirt_domain_interface_stats_receive_bytes_total{instanceId="' + this.instanceId + '"}[5m])/1024)', 'round(irate(libvirt_domain_interface_stats_transmit_bytes_total{instanceId="' + this.instanceId + '"}[5m])/1024)']),
          name: '["{target_device}_传入","{target_device}_传出"]',
          unit: 'KB/s'
        },
        {
          title: '网络传输总量',
          value: 'seventh',
          expr: JSON.stringify(['round(libvirt_domain_interface_stats_receive_bytes_total{instanceId="' + this.instanceId + '"} / 1024)', 'round(libvirt_domain_interface_stats_transmit_bytes_total{instanceId="' + this.instanceId + '"} / 1024)']),
          name: '["{target_device}_传入","{target_device}_传出"]',
          unit: 'KB'
        }
      ],
      usageData: {},
      detailData: {},
      detailMapList: [
        { name: 'IP', value: 'managerIp', unit: '' },
        { name: '规格', value: 'spec' },
        { name: '创建时间', value: 'gmtVmCreate', unit: '' },
        { name: '操作系统', value: 'osCategory' }
      ],
      dashboradData: {
        first: {},
        second: {},
        third: {},
        fourth: {},
        fifth: {},
        sixth: {},
        seventh: {}
      },
      cpuUsageTimeInterval: '',
      memUsageTimeInterval: ''
    }
  },
  methods: {
    getOverview() {
      getOpenstackVm(this.detailId).then((data) => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
          this.detailData.spec = (this.detailData.cpu ? this.detailData.cpu : 0) + 'C/' + (this.detailData.memory ? this.detailData.memory : 0) + 'GB/' + (this.detailData.disk == null ? 0 : this.detailData.disk) + 'GB'
        }
      })
    },
    getCpuUsage() {
      const expr = 'round((avg(irate(libvirt_domain_info_cpu_time_seconds_total{instanceId="' + this.instanceId + '"}[5m])) by (instanceId))*100/ avg(libvirt_domain_info_virtual_cpus) by (instanceId),0.01)'
      getUsage({
        expr: expr,
        simple: true
      }).then((data) => {
        if (data.success) {
          this.$set(this.usageData, 'cpuUsage1', {
            name: 'CPU利用率',
            data: { value: data.data, name: '%' },
            min: 0,
            max: 100
          })
          if (this.cpuUsageTimeInterval) {
            clearInterval(this.cpuUsageTimeInterval)
            this.cpuUsageTimeInterval = ''
          }
          this.cpuUsageTimeInterval = setInterval(() => {
            this.getCpuUsage()
          }, 60 * 1000)
        }
      })
    },
    getMemUsage() {
      const expr = 'round((1-libvirt_domain_memory_stat_unused/libvirt_domain_memory_stat_available{instanceId="' + this.instanceId + '"})*100,0.01)'
      getUsage({
        expr: expr,
        simple: true
      }).then((data) => {
        if (data.success) {
          this.$set(this.usageData, 'memUsage1', {
            name: '内存利用率',
            data: { value: data.data, name: '%' },
            min: 0,
            max: 100
          })
          if (this.memUsageTimeInterval) {
            clearInterval(this.memUsageTimeInterval)
            this.memUsageTimeInterval = ''
          }
          this.memUsageTimeInterval = setInterval(() => {
            this.getMemUsage()
          }, 60 * 1000)
        }
      })
    }
  },
  created() {
    for (const key in this.dashboradData) {
      const element = this.dashboradData[key]
      this.$set(element, 'step', null)
      this.$set(element, 'stepValue', 20)
      this.$set(element, 'defindTime', [])
    }
    this.getOverview()
    this.getCpuUsage()
    this.getMemUsage()
  },
  beforeDestroy() {
    clearInterval(this.cpuUsageTimeInterval)
    clearInterval(this.memUsageTimeInterval)
  }
}
</script>
<style></style>
