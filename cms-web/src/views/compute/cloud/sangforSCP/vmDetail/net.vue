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
    }
  },
  data() {
    return {
      // 包接收流速 sangfor_vm_net_received_average
      // 包发送流速 sangfor_vm_net_transmitted_average
      // 包接收速率 sangfor_vm_net_packetsRx_summation
      // 包发送速率 sangfor_vm_net_packetsTx_summation
      typeData: [
        {
          title: '包接收流速',
          value: 'received',
          expr: JSON.stringify(['round(sangfor_vm_net_received_average{instanceId="' + this.detailUuid + '"},0.01)']),
          name: '["网络使用速率"]',
          unit: 'KB/s'
        },
        {
          title: '包发送流速',
          value: 'transmitted',
          expr: JSON.stringify(['round(sangfor_vm_net_transmitted_average{instanceId="' + this.detailUuid + '"},0.01)']),
          name: '["网络使用速率"]',
          unit: 'KB/s'
        },
        {
          title: '包接收速率',
          value: 'packetsRx',
          expr: JSON.stringify(['round(sangfor_vm_net_packetsRx_summation{instanceId="' + this.detailUuid + '"},0.01)']),
          name: '["网络使用速率"]',
          unit: '个/s'
        },
        {
          title: '包发送速率',
          value: 'packetsTx',
          expr: JSON.stringify(['round(sangfor_vm_net_packetsTx_summation{instanceId="' + this.detailUuid + '"},0.01)']),
          name: '["网络使用速率"]',
          unit: '个/s'
        }
      ],
      dashboradData: {
        received: {},
        transmitted: {},
        packetsRx: {},
        packetsTx: {}
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
