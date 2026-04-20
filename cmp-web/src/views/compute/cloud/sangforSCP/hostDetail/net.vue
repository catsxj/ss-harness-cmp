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
import { getCharts } from 'services/monitor'
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
      // 包接收流速 sangfor_Host_net_received_average
      // 包发送流速 sangfor_Host_net_transmitted_average
      typeData: [
        {
          title: '包接收流速',
          value: 'received',
          expr: JSON.stringify(['sangfor_Host_net_received_average{instanceId="' + this.detailUuid + '"}']),
          name: '["包接收流速"]',
          unit: 'KB/s'
        },
        {
          title: '包发送流速',
          value: 'transmitted',
          expr: JSON.stringify(['sangfor_Host_net_transmitted_average{instanceId="' + this.detailUuid + '"}']),
          name: '["包发送流速"]',
          unit: 'KB/s'
        }
      ],
      dashboradData: {
        received: {},
        transmitted: {}
      },
      userDefindVisible: false,
      userDefindTime: []
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
