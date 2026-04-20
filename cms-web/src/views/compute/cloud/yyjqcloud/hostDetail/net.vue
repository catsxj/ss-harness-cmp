<template>
  <el-row :gutter="20">
    <el-col :span="12" v-for="chart in typeData" :key="chart.value">
      <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
    </el-col>
  </el-row>
</template>
<script>
import chartBox from 'views/components/chartBox.vue'
export default {
  components: { chartBox },
  props: {
    detailId: {
      type: Number
    },
    detailName: {
      type: String
    },
    uuid: {
      type: String
    },
    instanceId: {
      type: String
    },
    vendorId: {
      type: Number
    }
  },
  data() {
    return {
      typeData: [
        { title: '流量监控发送速率', value: 'bytesSent', expr: JSON.stringify(['round(yyjqcloud_host_net_bytes_sent{instance_id="' + this.instanceId + '",vendor_id="' + this.vendorId + '"}, 0.01)']), name: "['$tag']", unit: 'MB/s' },
        { title: '流量监控接收速率', value: 'bytesRecv', expr: JSON.stringify(['round(yyjqcloud_host_net_bytes_recv{instance_id="' + this.instanceId + '",vendor_id="' + this.vendorId + '"}, 0.01)']), name: "['$tag']", unit: 'MB/s' },
        { title: 'pps发送', value: 'packetsSent', expr: JSON.stringify(['round(yyjqcloud_host_net_packets_sent{instance_id="' + this.instanceId + '",vendor_id="' + this.vendorId + '"}, 0.01)']), name: "['$tag']", unit: 'pps' },
        { title: 'pps接收', value: 'packetsRecv', expr: JSON.stringify(['round(yyjqcloud_host_net_packets_recv{instance_id="' + this.instanceId + '",vendor_id="' + this.vendorId + '"}, 0.01)']), name: "['$tag']", unit: 'pps' },
        { title: '入流量包错误率', value: 'errIn', expr: JSON.stringify(['round(yyjqcloud_host_net_err_in{instance_id="' + this.instanceId + '",vendor_id="' + this.vendorId + '"}, 0.01)']), name: "['$tag']", unit: 'pps' },
        { title: '出流量包错误率', value: 'errOut', expr: JSON.stringify(['round(yyjqcloud_host_net_err_out{instance_id="' + this.instanceId + '",vendor_id="' + this.vendorId + '"}, 0.01)']), name: "['$tag']", unit: 'pps' },
        { title: '入流量丢包率', value: 'dropIn', expr: JSON.stringify(['round(yyjqcloud_host_net_drop_in{instance_id="' + this.instanceId + '",vendor_id="' + this.vendorId + '"}, 0.01)']), name: "['$tag']", unit: 'pps' },
        { title: '出流量丢包率', value: 'dropOut', expr: JSON.stringify(['round(yyjqcloud_host_net_drop_out{instance_id="' + this.instanceId + '",vendor_id="' + this.vendorId + '"}, 0.01)']), name: "['$tag']", unit: 'pps' }
      ],
      dashboradData: {
        bytesSent: {},
        bytesRecv: {},
        packetsSent: {},
        packetsRecv: {},
        errIn: {},
        errOut: {},
        dropIn: {},
        dropOut: {}
      }
    }
  },
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
