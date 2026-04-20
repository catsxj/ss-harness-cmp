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
      type: Number
    },
    identifier: {
      type: String
    },
    hostName: {
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
          title: '内存利用率',
          value: 'yyjqcloud_cvm_memory',
          expr: JSON.stringify(['round(yyjqcloud_cvm_memory{instance_id="' + this.instanceId + '"}, 0.01)']),
          name: "['内存利用率']",
          unit: '%'
        }
      ],
      dashboradData: {
        yyjqcloud_cvm_memory: {}
      }
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
  },
  beforeDestroy() {}
}
</script>
