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
    detailUuid: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        {
          title: '网络实时发送速率',
          value: 'netprocsb',
          expr: JSON.stringify(['bocloud_hmc_proc_vios_network_sb{parentUuid="' + this.detailUuid + '"}']),
          name: '["$instanceUuid"]',
          unit: 'KB/s'
        },
        {
          title: '网络实时接收速率',
          value: 'netprocrb',
          expr: JSON.stringify(['bocloud_hmc_proc_vios_network_rb{parentUuid="' + this.detailUuid + '"}']),
          name: '["$instanceUuid"]',
          unit: 'KB/s'
        },
        {
          title: '网络累计发送流量',
          value: 'netltmsb',
          expr: JSON.stringify(['round(bocloud_hmc_ltm_vios_network_sb{parentUuid="' + this.detailUuid + '"} /1024,0.01)']),
          name: '["$instanceUuid"]',
          unit: 'MB'
        },
        {
          title: '网络累计接收流量',
          value: 'netltmrb',
          expr: JSON.stringify(['round(bocloud_hmc_ltm_vios_network_rb{parentUuid="' + this.detailUuid + '"} /1024,0.01)']),
          name: '["$instanceUuid"]',
          unit: 'MB'
        }
      ],
      dashboradData: {
        netprocsb: {},
        netprocrb: {},
        netltmsb: {},
        netltmrb: {}
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
<style scoped></style>
