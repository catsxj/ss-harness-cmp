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
import chartBox from '../components2/chartBox.vue'
export default {
  components: { chartBox },
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
    uuid: {
      type: String
    },
    detail: {
      type: Object
    }
  },
  data () {
    return {
      detailData: {},
      typeData: [
        // { title: '磁盘使用速率', value: 'usage', expr: JSON.stringify(['round(vsphere_vm_disk_usage_average{disk="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"},0.01)']), name: '["磁盘使用速率"]', unit: 'KB/s' },
        // { title: '磁盘每秒读取/写入次数', value: 'diskNumberAveraged', expr: JSON.stringify(['vsphere_vm_disk_numberReadAveraged_average{vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"}', 'vsphere_vm_disk_numberWriteAveraged_average{vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"}']), name: '["磁盘每秒读取次数", "磁盘每秒写入次数"]', unit: '次' },
        // { title: '磁盘读取/写入速率', value: 'disk', expr: JSON.stringify(['round(vsphere_vm_disk_read_average{disk="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"},0.01)', 'round(vsphere_vm_disk_write_average{disk="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"},0.01)']), name: '["磁盘读取速率", "磁盘写入速率"]', unit: 'KB/s' }
        { title: '磁盘使用率', value: 'usage', expr: JSON.stringify(['round(bocloud_fusionsphere_vm_disk_usage{vendorId="' + this.detail.vendorId + '",instance_id="' + this.detail.instanceId + '"},0.01)']), name: '["磁盘使用率"]', unit: '%' },
        { title: '磁盘I/O写入', value: 'diskNumberAveraged', expr: JSON.stringify(['round(bocloud_fusionsphere_vm_disk_io_in{vendorId="' + this.detail.vendorId + '",instance_id="' + this.detail.instanceId + '"},0.01)']), name: '["磁盘I/O写入"]', unit: 'KB/s' },
        { title: '磁盘I/O写入', value: 'disk', expr: JSON.stringify(['round(bocloud_fusionsphere_vm_disk_io_out{vendorId="' + this.detail.vendorId + '",instance_id="' + this.detail.instanceId + '"},0.01)']), name: '["磁盘I/O写入"]', unit: 'KB/s' }
        // { title: '磁盘每秒读取/写入次数', value: 'diskNumberAveraged', expr: JSON.stringify(['vsphere_vm_disk_numberReadAveraged_average{vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"}', 'vsphere_vm_disk_numberWriteAveraged_average{vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"}']), name: '["磁盘每秒读取次数", "磁盘每秒写入次数"]', unit: '次' },
        // { title: '磁盘读取/写入速率', value: 'disk', expr: JSON.stringify(['round(vsphere_vm_disk_read_average{disk="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"},0.01)', 'round(vsphere_vm_disk_write_average{disk="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"},0.01)']), name: '["磁盘读取速率", "磁盘写入速率"]', unit: 'KB/s' }
      ],
      dashboradData: {
        usage: {},
        diskNumberAveraged: {},
        disk: {}
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
  }
}
</script>
