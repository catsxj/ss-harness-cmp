<template>
  <div>
    <el-row :gutter="5">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import chartBox from 'views/monitor/components/chartBox.vue'
export default {
  components: { chartBox },
  props: {
    detailId: {
      type: Number
    },
    instanceId: {
      type: String
    }
  },
  data () {
    return {
      typeData: [
        {
          title: 'CPU利用率',
          value: 'cpu',
          expr: JSON.stringify([
            'round(zstack_vm_CPUAverageUsedUtilization{VMUuid="' + this.instanceId + '"}, 0.01)'
          ]),
          name: "['CPU利用率']",
          unit: '%'
        },
        {
          title: '内存利用率',
          value: 'memory',
          expr: JSON.stringify([
            'round(zstack_vm_MemoryUsedInPercent{VMUuid="' + this.instanceId + '"}, 0.01)'
          ]),
          name: "['内存利用率']",
          unit: '%'
        },
        {
          title: '磁盘读速度',
          value: 'diskRead',
          expr: JSON.stringify([
            'zstack_vm_DiskReadBytes{VMUuid="' + this.instanceId + '"}/1000'
          ]),
          name: "['$DiskDeviceLetter']",
          unit: 'KB/s'
        },
        {
          title: '磁盘写速度',
          value: 'diskWrite',
          expr: JSON.stringify([
            'zstack_vm_DiskWriteBytes{VMUuid="' + this.instanceId + '"}/1000'
          ]),
          name: "['$DiskDeviceLetter']",
          unit: 'KB/s'
        },
        {
          title: '磁盘读IOPS',
          value: 'diskReadOps',
          expr: JSON.stringify([
            'zstack_vm_DiskReadOps{VMUuid="' + this.instanceId + '"}'
          ]),
          name: "['$DiskDeviceLetter']",
          unit: 'ops/s'
        },
        {
          title: '磁盘写IOPS',
          value: 'diskWriteOps',
          expr: JSON.stringify([
            'zstack_vm_DiskWriteOps{VMUuid="' + this.instanceId + '"}'
          ]),
          name: "['$DiskDeviceLetter']",
          unit: 'ops/s'
        },
        {
          title: '网卡发送数据速率',
          value: 'networkOutput',
          expr: JSON.stringify([
            'zstack_vm_NetworkOutBytes{VMUuid="' + this.instanceId + '"}/1000'
          ]),
          name: "['$NetworkDeviceLetter']",
          unit: 'KB/s'
        },
        {
          title: '网卡接收数据速率',
          value: 'networkInput',
          expr: JSON.stringify([
            'zstack_vm_NetworkInBytes{VMUuid="' + this.instanceId + '"}/1000'
          ]),
          name: "['$NetworkDeviceLetter']",
          unit: 'KB/s'
        },
        {
          title: '网卡发送包速率',
          value: 'networkOutPackage',
          expr: JSON.stringify([
            'zstack_vm_NetworkOutPackets{VMUuid="' + this.instanceId + '"}'
          ]),
          name: "['$NetworkDeviceLetter']",
          unit: 'pps'
        },
        {
          title: '网卡接收包速率',
          value: 'networkInPackage',
          expr: JSON.stringify([
            'zstack_vm_NetworkInPackets{VMUuid="' + this.instanceId + '"}'
          ]),
          name: "['$NetworkDeviceLetter']",
          unit: 'pps'
        },
        {
          title: '网卡出包丢弃速率',
          value: 'networkOutErrorPackage',
          expr: JSON.stringify([
            'zstack_vm_NetworkOutErrors{VMUuid="' + this.instanceId + '"}'
          ]),
          name: "['$NetworkDeviceLetter']",
          unit: 'pps'
        },
        {
          title: '网卡入包丢弃速率',
          value: 'networkInErrorPackage',
          expr: JSON.stringify([
            'zstack_vm_NetworkInErrors{VMUuid="' + this.instanceId + '"}'
          ]),
          name: "['$NetworkDeviceLetter']",
          unit: 'pps'
        }
      ],
      dashboradData: {
        cpu: {},
        memory: {},
        diskRead: {},
        diskWrite: {},
        diskReadOps: {},
        diskWriteOps: {},
        diskAllUsed: {},
        diskAllUsedRate: {},
        fileUsedDisk: {},
        fileUsedDiskRate: {},
        networkOutput: {},
        networkInput: {},
        networkOutPackage: {},
        networkInPackage: {},
        networkOutErrorPackage: {},
        networkInErrorPackage: {}
      }
    }
  },
  methods: {
  },
  created () {
    for (const key in this.dashboradData) {
      const element = this.dashboradData[key];
      this.$set(element, 'step', null)
      this.$set(element, 'stepValue', 20)
      this.$set(element, 'defindTime', [])
    }
  },
  beforeDestroy () {
  }
}
</script>
<style>
</style>
