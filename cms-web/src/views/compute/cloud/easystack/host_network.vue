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
    }
  },
  data() {
    return {
      typeData: [
        {
          title: '网络流入速率',
          value: 'first',
          expr: JSON.stringify(['round(1/1024*irate(node_network_receive_bytes_total{host_id="' + this.detailId + '",device=~"en.*|em.*|eth.*|ten.*|one.*"}[5m]))']),
          name: '["$device"]',
          unit: 'KB/s'
        },
        {
          title: '网络流出速率',
          value: 'second',
          expr: JSON.stringify(['round(1/1024*irate(node_network_transmit_bytes_total{host_id="' + this.detailId + '",device=~"en.*|em.*|eth.*|ten.*|one.*"}[5m]))']),
          name: '["$device"]',
          unit: 'KB/s'
        }
      ],
      dashboradData: {
        first: {},
        second: {}
      }
    }
  },
  beforeDestroy() {},
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
<style></style>
