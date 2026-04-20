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
    instanceId: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        {
          title: '网卡流入带宽',
          value: 'yyjqcloud_cvm_network_in',
          expr: JSON.stringify(['yyjqcloud_cvm_network_in{instance_id="' + this.instanceId + '"}']),
          name: "['网卡流入带宽']",
          unit: 'Byte/s'
        },
        {
          title: '网卡流出带宽',
          value: 'yyjqcloud_cvm_network_out',
          expr: JSON.stringify(['yyjqcloud_cvm_network_out{instance_id="' + this.instanceId + '"}']),
          name: "['网卡流出带宽']",
          unit: 'Byte/s'
        }
      ],
      dashboradData: {
        yyjqcloud_cvm_network_in: {},
        yyjqcloud_cvm_network_out: {}
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
