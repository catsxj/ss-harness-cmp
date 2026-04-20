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
    }
  },
  data() {
    return {
      typeData: [
        {
          title: '网络使用速率',
          value: 'usage',
          expr: JSON.stringify(['bocloud_sangfor_hci_host_INTERFACE{id="' + this.detailId + '"}']),
          name: '["网络使用速率"]',
          unit: 'KB/s'
        }
      ],
      dashboradData: {
        usage: {}
      },
      userDefindVisible: false,
      userDefindTime: []
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
  }
}
</script>
