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
    detailUuid: {
      type: String
    },
    detailVendorId: {
      type: Number
    },
    uuid: {
      type: String
    }
  },
  data() {
    return {
      detailData: {},
      typeData: [
        { title: '磁盘使用速率', value: 'usage', expr: JSON.stringify(['round(cnware_vm_disk_usage_average{uuid="' + this.detailUuid + '",vendorId="' + this.detailVendorId + '"},0.01)']), name: '["磁盘使用速率"]', unit: 'KB/s' },
        {
          title: '磁盘每秒读取/写入次数',
          value: 'diskNumberAveraged',
          expr: JSON.stringify(['cnware_vm_disk_io_throughput_write{uuid="' + this.detailUuid + '",vendorId="' + this.detailVendorId + '"}', 'cnware_vm_disk_io_throughput_read{uuid="' + this.detailUuid + '",vendorId="' + this.detailVendorId + '"}']),
          name: '["磁盘每秒读取次数", "磁盘每秒写入次数"]',
          unit: '次'
        },
        {
          title: '磁盘读取/写入速率',
          value: 'disk',
          expr: JSON.stringify([
            'round(cnware_vm_disk_io_request_ioReq_read{uuid="' + this.detailUuid + '",vendorId="' + this.detailVendorId + '"},0.01)',
            'round(cnware_vm_disk_io_request_ioReq_write{uuid="' + this.detailUuid + '",vendorId="' + this.detailVendorId + '"},0.01)'
          ]),
          name: '["磁盘读取速率", "磁盘写入速率"]',
          unit: 'KB/s'
        }
      ],
      dashboradData: {
        usage: {},
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
  }
}
</script>
