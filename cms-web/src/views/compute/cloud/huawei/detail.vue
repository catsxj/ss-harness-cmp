<template>
  <div>
    <detail-map :detail="detailData" :list="detailMapList" v-if="isShow"></detail-map>
    <el-row :gutter="5">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import chartBox from 'views/components/chartBox.vue'
import { getOpenstackVm } from 'services/monitor'
import detailMap from 'views/components/detailMap.vue'
export default {
  components: { detailMap, chartBox },
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
          value: 'cpu',
          expr: JSON.stringify(['round(huawei_agt_ecs_cpu_usage{instance_id="' + this.instanceId + '"} or huawei_sys_ecs_cpu_util{instance_id="' + this.instanceId + '"}, 0.01)']),
          name: "['CPU利用率']",
          unit: '%'
        },
        {
          title: '内存利用率',
          value: 'memory',
          expr: JSON.stringify(['round(huawei_agt_ecs_mem_usedPercent{instance_id="' + this.instanceId + '"} or huawei_sys_ecs_mem_util{instance_id="' + this.instanceId + '"}, 0.01)']),
          name: "['内存利用率']",
          unit: '%'
        },
        {
          title: '文件系统剩余存储量',
          value: 'disk_freeReserves',
          expr: JSON.stringify([`round(huawei_agt_ecs_disk_free{instance_id="${this.instanceId}",path!=""},0.01)`]),
          name: '["$path"]',
          unit: 'GB'
        },
        {
          title: '文件系统利用率',
          value: 'disk_usePercent',
          expr: JSON.stringify([`round(huawei_agt_ecs_disk_usedPercent{path!="",instance_id="${this.instanceId}"},0.01)`]),
          name: '["$path"]',
          unit: '%'
        },
        {
          title: '磁盘读带宽',
          value: 'disk_read_bytes',
          expr: JSON.stringify(['round(huawei_sys_ecs_disk_read_bytes_rate{instance_id="' + this.instanceId + '"}/1024 ,0.01)']),
          name: "['磁盘读带宽']",
          unit: 'KB/s'
        },
        {
          title: '磁盘写带宽',
          value: 'disk_write_bytes',
          expr: JSON.stringify(['round(huawei_sys_ecs_disk_write_bytes_rate{instance_id="' + this.instanceId + '"}/1024 ,0.01)']),
          name: "['磁盘写带宽']",
          unit: 'KB/s'
        },
        {
          title: '磁盘读IOPS',
          value: 'disk_read_requests',
          expr: JSON.stringify(['round(huawei_sys_ecs_disk_read_requests_rate{instance_id="' + this.instanceId + '"},0.01)']),
          name: "['磁盘读IOPS']",
          unit: '请求/秒'
        },
        {
          title: '磁盘写IOPS',
          value: 'disk_write_requests',
          expr: JSON.stringify(['round(huawei_sys_ecs_disk_write_requests_rate{instance_id="' + this.instanceId + '"},0.01)']),
          name: "['磁盘写IOPS']",
          unit: '请求/秒'
        },
        {
          title: '带外网络流入速率',
          value: 'network_in',
          expr: JSON.stringify(['round(huawei_sys_ecs_network_incoming_bytes_aggregate_rate{instance_id="' + this.instanceId + '",}/1024,0.01)']),
          name: "['带外网络流入速率']",
          unit: 'KB/s'
        },
        {
          title: '带外网络流出速率',
          value: 'network_out',
          expr: JSON.stringify(['round(huawei_sys_ecs_network_outgoing_bytes_aggregate_rate{instance_id="' + this.instanceId + '"}/1024,0.01)']),
          name: "['带外网络流出速率']",
          unit: 'KB/s'
        },
        {
          title: '云主机入方向带宽',
          value: 'bandwidth_in',
          expr: JSON.stringify(['round(huawei_sys_ecs_network_vm_bandwidth_in{instance_id="' + this.instanceId + '"})']),
          name: "['云主机入方向带宽']",
          unit: 'bit/s'
        },
        {
          title: '云主机出方向带宽',
          value: 'bandwidth_out',
          expr: JSON.stringify(['round(huawei_sys_ecs_network_vm_bandwidth_out{instance_id="' + this.instanceId + '"})']),
          name: "['云主机出方向带宽']",
          unit: 'bit/s'
        },
        {
          title: '网络连接数',
          value: 'network_connection',
          expr: JSON.stringify(['huawei_sys_ecs_network_vm_connections{instance_id="' + this.instanceId + '"}']),
          name: "['网络连接数']",
          unit: 'count'
        }
      ],
      detailData: {
        floatingIp: ''
      },
      detailMapList: [
        { name: 'IP', value: 'privateIps', unit: '', type: 'huawei', value2: 'floatingIp' },
        { name: '规格', value: 'spec' },
        { name: '创建时间', value: 'gmtCreate', unit: '' },
        { name: '操作系统', value: 'osCategory' }
      ],
      dashboradData: {
        cpu: {},
        memory: {},
        disk_free: {},
        disk_usedPercent: {},
        disk_read_bytes: {},
        disk_write_bytes: {},
        disk_read_requests: {},
        disk_write_requests: {},
        network_in: {},
        network_out: {},
        network_connection: {},
        disk_usePercent: {},
        disk_freeReserves: {},
        disk_total: {},
        bandwidth_in: {},
        bandwidth_out: {}
      }
    }
  },
  methods: {
    getOverview() {
      getOpenstackVm(this.detailId).then((data) => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
          if (this.detailData.privateIps) this.detailData.privateIps = JSON.parse(this.detailData.privateIps)
          if (this.detailData.publicIps) this.detailData.publicIps = JSON.parse(this.detailData.publicIps)
          this.detailData.spec = (this.detailData.cpu ? this.detailData.cpu : 0) + 'C/' + (this.detailData.memory ? this.detailData.memory : 0) + 'GB/' + (this.detailData.disk == null ? 0 : this.detailData.disk) + 'GB'
        }
      })
    }
  },
  created() {
    this.getOverview()
    for (const key in this.dashboradData) {
      const element = this.dashboradData[key]
      this.$set(element, 'step', null)
      this.$set(element, 'stepValue', 20)
      this.$set(element, 'defindTime', [])
    }
  },
  beforeDestroy() {}
}
</script>
<style></style>
