<template>
  <el-row :gutter="5">
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
      type: [Number, String]
    },
    identifier: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        {
          title: '网络吞吐量',
          value: 'packets',
          expr: JSON.stringify(['h3c_host_if_rx_bytes_rate{interface="instance-total",name="' + this.identifier + '"}', 'h3c_host_if_tx_bytes_rate{interface="instance-total",name="' + this.identifier + '"}']),
          name: "['接收', '发送']",
          unit: 'Mbps'
        }
      ],
      dashboradData: {
        netspace: {},
        packets: {},
        usage: {}
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
