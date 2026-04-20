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
import chartBox from 'views/components/chartBox.vue'
export default {
  components: { chartBox },
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
  data() {
    return {
      typeData: [
        {
          title: '磁盘使用速率',
          value: 'usage',
          expr: JSON.stringify(['vsphere_vm_disk_usage_average{disk="instance-total",vmname="' + this.identifier + '",vcenter="' + this.address + '"}']),
          name: '["磁盘使用速率"]',
          unit: 'KB/s'
        },
        {
          title: '磁盘读取/写入请求数',
          value: 'diskNumber',
          expr: JSON.stringify(['vsphere_vm_disk_numberRead_summation{vmname="' + this.identifier + '",vcenter="' + this.address + '"}', 'vsphere_vm_disk_numberWrite_summation{vmname="' + this.identifier + '",vcenter="' + this.address + '"}']),
          name: '["磁盘读取请求数", "磁盘写入请求数"]',
          unit: '次'
        },
        {
          title: '磁盘每秒读取/写入次数',
          value: 'diskNumberAveraged',
          expr: JSON.stringify(['vsphere_vm_disk_numberReadAveraged_average{vmname="' + this.identifier + '",vcenter="' + this.address + '"}', 'vsphere_vm_disk_numberWriteAveraged_average{vmname="' + this.identifier + '",vcenter="' + this.address + '"}']),
          name: '["磁盘每秒读取次数", "磁盘每秒写入次数"]',
          unit: '次'
        },
        {
          title: '磁盘读取/写入速率',
          value: 'disk',
          expr: JSON.stringify(['vsphere_vm_disk_read_average{disk="instance-total",vmname="' + this.identifier + '",vcenter="' + this.address + '"}', 'vsphere_vm_disk_write_average{disk="instance-total",vmname="' + this.identifier + '",vcenter="' + this.address + '"}']),
          name: '["磁盘读取速率", "磁盘写入速率"]',
          unit: 'KB/s'
        }
      ],
      dashboradData: {
        usage: {},
        diskNumber: {},
        diskNumberAveraged: {},
        disk: {}
      }
    }
  },
  methods: {},
  created() {
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
