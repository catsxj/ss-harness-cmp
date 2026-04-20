<template>
  <el-row :gutter="20">
    <el-col :span="12" v-for="chart in typeData" :key="chart.value">
      <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
    </el-col>
  </el-row>
</template>
<script>
import chartBox from 'views/monitor/components/chartBox.vue'
export default {
  components: { chartBox },
  props: {
    detailId: {
      type: Number
    }
  },
  data() {
    return {
      typeData: [
        { title: '网络发送速率', value: 'read', expr: JSON.stringify(['round(bocloud_cloudtower_vm_elf_vm_network_transmit_speed_bps{id="' + this.detailId + '"}, 0.01)']), name: "['网络发送速率']", unit: 'bps' },
        { title: '网络接收速率', value: 'write', expr: JSON.stringify(['round(bocloud_cloudtower_vm_elf_vm_network_receive_speed_bps{id="' + this.detailId + '"}, 0.01)']), name: "['网络接收速率']", unit: 'bps' }
      ],
      dashboradData: {
        read: {},
        write: {}
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
