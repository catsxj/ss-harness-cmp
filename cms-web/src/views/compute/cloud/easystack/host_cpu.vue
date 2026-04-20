<template>
  <div>
    <el-row :gutter="5">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <chart-box :params-data="chart" :item-data="dashboradData[chart.value]" v-if="dashboradData[chart.value].defindTime !== null"></chart-box>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import chartBox from 'views/components/chartBox.vue'
import { init } from 'views/components/util.js'
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
          title: 'CPU利用率',
          value: 'users',
          expr: JSON.stringify(['round((1 - avg(irate(node_cpu_seconds_total{host_id="' + this.detailId + '",mode="idle"}[5m])) by (host_id))*100,0.01)']),
          name: '["CPU利用率"]',
          unit: '%'
        },
        {
          title: 'CPU使用情况',
          value: 'other',
          expr: JSON.stringify(['round((avg(irate(node_cpu_seconds_total{host_id="' + this.detailId + '"}[5m])) by (host_id,mode))*100,0.01)']),
          name: '["$mode"]',
          unit: '%'
        }
      ],
      dashboradData: {
        users: {},
        other: {}
      }
    }
  },
  beforeDestroy() {},
  methods: {},
  created() {
    init(this.dashboradData, this)
  }
}
</script>
<style></style>
