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
          title: '内存量',
          value: 'memory',
          expr: JSON.stringify(['round(bocloud_hmc_proc_vios_mem_total{instanceUuid="' + this.detailUuid + '"} /1024,0.01)', 'round(bocloud_hmc_proc_vios_mem_utilized{instanceUuid="' + this.detailUuid + '"} /1024,0.01)']),
          name: "['总量', '已使用']",
          unit: 'GB'
        }
      ],
      dashboradData: {
        memory: {}
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
