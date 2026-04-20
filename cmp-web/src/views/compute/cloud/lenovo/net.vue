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
    instanceId: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        {
          title: '网络接收/发送速率',
          value: 'netSpeed',
          expr: JSON.stringify([
            'bocloud_lenovo_vm_network_receive{instanceId="' + this.instanceId + '"}',
            'bocloud_lenovo_vm_network_transmit{instanceId="' + this.instanceId + '"}'
          ]),
          name: '["网络接收速率", "网络发送速率"]',
          unit: 'byte/s'
        }
      ],
      dashboradData: {
        netSpeed: {}
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
