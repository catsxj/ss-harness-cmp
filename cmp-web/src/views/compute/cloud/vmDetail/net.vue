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
    hostName: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        {
          title: '网络数据接收/传输速率',
          value: 'netspace',
          expr: JSON.stringify([
            'round(vsphere_vm_net_received_average{interface="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"},0.01)',
            'round(vsphere_vm_net_transmitted_average{interface="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"},0.01)'
          ]),
          name: '["网络数据接收速率", "网络数据传输速率"]',
          unit: 'KB/s'
        },
        {
          title: '网络已收到/已传输的数据包数',
          value: 'packets',
          expr: JSON.stringify([
            'vsphere_vm_net_packetsRx_summation{interface="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"}',
            'vsphere_vm_net_packetsTx_summation{interface="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"}'
          ]),
          name: '["网络已收到的数据包数", "网络已传输的数据包数"]',
          unit: '个'
        },
        {
          title: '网络使用速率',
          value: 'usage',
          expr: JSON.stringify(['round(vsphere_vm_net_usage_average{interface="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"},0.01)']),
          name: '["网络使用速率"]',
          unit: 'KB/s'
        }
      ],
      dashboradData: {
        netspace: {},
        packets: {},
        usage: {}
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
