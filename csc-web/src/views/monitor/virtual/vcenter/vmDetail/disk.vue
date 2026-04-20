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
import { getCharts, getHostCpu } from 'services/monitor'
import chartBox from 'views/monitor/components/chartBox.vue'
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
    }
  },
  data() {
    return {
      detailData: {},
      typeData: [
        { title: '磁盘使用速率', value: 'usage', expr: JSON.stringify(['round(vsphere_vm_disk_usage_average{disk="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"},0.01)']), name: '["磁盘使用速率"]', unit: 'KB/s' },
        {
          title: '磁盘每秒读取/写入次数',
          value: 'diskNumberAveraged',
          expr: JSON.stringify(['vsphere_vm_disk_numberReadAveraged_average{vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"}', 'vsphere_vm_disk_numberWriteAveraged_average{vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"}']),
          name: '["磁盘每秒读取次数", "磁盘每秒写入次数"]',
          unit: '次'
        },
        {
          title: '磁盘读取/写入速率',
          value: 'disk',
          expr: JSON.stringify([
            'round(vsphere_vm_disk_read_average{disk="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"},0.01)',
            'round(vsphere_vm_disk_write_average{disk="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"},0.01)'
          ]),
          name: '["磁盘读取速率", "磁盘写入速率"]',
          unit: 'KB/s'
        }
      ],
      dashboradData: {
        usage: {},
        diskNumberAveraged: {},
        disk: {}
      },
      userDefindVisible: false,
      userDefindTime: []
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
  }
}
</script>
