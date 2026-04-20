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
      type: String
    },
    vendorId: {
      type: Number
    },
    instanceId: {
      type: Number
    }
  },
  data() {
    return {
      typeData: [
        {
          title: '内存利用率',
          value: 'memory',
          expr: JSON.stringify(['bocloud_fusioncloud_vm_memoryUsage{id="' + this.instanceId + '",vendorId="' + this.vendorId + '"}']),
          name: "['内存利用率']",
          unit: '%'
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
<style></style>
