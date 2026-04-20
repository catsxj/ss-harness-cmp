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
    },
    typeData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      tceRef: {
        step: null,
        stepValue: 20,
        defindTime: []
      },
      dashboradData: {}
    }
  },
  created() {
    this.typeData.forEach((item) => {
      item.expr = JSON.stringify([`round(${item.value}{instanceId="${this.instanceId}"} ,0.01)`])
      item.name = ['apsarastack_ecs_net_tcpconnection_average'].includes(item.value) ? "['$state']" : ['apsarastack_ecs_diskusage_utilization_average'].includes(item.value) ? "['$device']" : item.name
      this.$set(this.dashboradData, item.value, {})
    })
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
