<template>
  <div>
    <detail-map :detail="detailData" :list="detailMapList"></detail-map>
    <el-row :gutter="20">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import detailMap from '../detailMap'
import { getCharts, getHostDisk } from 'services/monitor'
import chartBox from 'views/components/chartBox.vue'
export default {
  components: { detailMap, chartBox },
  props: {
    detailId: {
      type: Number
    },
    managerIp: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        { title: '磁盘使用速率', value: 'usage', expr: JSON.stringify(['round(vsphere_host_disk_usage_average{esxhostname="' + this.managerIp + '"},0.01)']), name: "['磁盘使用速率']", unit: 'KB/s' },
        {
          title: '磁盘读取/写入速率',
          value: 'diskNumber',
          expr: JSON.stringify(['vsphere_host_disk_numberRead_summation{esxhostname="' + this.managerIp + '"}', 'vsphere_host_disk_numberWrite_summation{esxhostname="' + this.managerIp + '"}']),
          name: "['磁盘读取请求数', '磁盘写入请求数']",
          unit: '次'
        },
        {
          title: '磁盘每秒读取/写入次数',
          value: 'diskNumberAveraged',
          expr: JSON.stringify(['vsphere_host_disk_numberReadAveraged_average{esxhostname="' + this.managerIp + '"}', 'vsphere_host_disk_numberWriteAveraged_average{esxhostname="' + this.managerIp + '"}']),
          name: "['磁盘每秒读取次数', '磁盘每秒写入次数']",
          unit: '次'
        },
        {
          title: '磁盘读取请求/写入平均数',
          value: 'disk',
          expr: JSON.stringify(['vsphere_host_disk_read_average{disk="instance-total",esxhostname="' + this.managerIp + '"}', 'vsphere_host_disk_write_average{disk="instance-total",esxhostname="' + this.managerIp + '"}']),
          name: "['磁盘读取请求平均数', '磁盘写入请求平均数']",
          unit: '次'
        }
      ],
      detailData: {},
      detailMapList: [
        { name: '磁盘总量', value: 'diskCapacity', unit: 'GB' },
        { name: '磁盘使用量', value: 'diskUsed', unit: 'GB' },
        { name: '磁盘剩余量', value: 'diskFree', unit: 'GB' }
      ],
      dashboradData: {
        usage: {},
        diskNumber: {},
        diskNumberAveraged: {},
        disk: {}
      },
      userDefindVisible: false,
      userDefindTime: []
    }
  },
  methods: {
    getDetail() {
      getHostDisk(this.detailId).then((data) => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
        }
      })
    }
  },
  created() {
    this.getDetail()
    for (const key in this.dashboradData) {
      const element = this.dashboradData[key]
      this.$set(element, 'step', null)
      this.$set(element, 'stepValue', 20)
      this.$set(element, 'defindTime', [])
    }
  }
}
</script>
