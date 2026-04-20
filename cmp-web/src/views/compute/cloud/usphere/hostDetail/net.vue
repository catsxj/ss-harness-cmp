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
      typeData: [
        {
          title: '网络速率',
          value: 'netIo',
          expr: JSON.stringify([
            'round(bocloud_uis_host_net_in{instanceId="' + this.detailUuid + '"},0.01)',
            'round(bocloud_uis_host_net_out{instanceId="' + this.detailUuid + '"},0.01)'
          ]),
          name: "['网络接收速率', '网络发送速率']",
          unit: 'KBps'
        }
      ],
      dashboradData: {
        netIo: {}
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
