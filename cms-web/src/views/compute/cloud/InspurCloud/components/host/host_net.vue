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
    }
  },
  data() {
    return {
      typeData: [
        {
          title: '网络流入流出速率',
          value: 'byte',
          expr: JSON.stringify(['bocloud_inspurcloud_host_nicByteIn{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}', 'bocloud_inspurcloud_host_nicByteOut{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: "['网络流入速率', '网络流出速率']",
          unit: 'KB/s'
        },
        { title: '网络丢包百分比', value: 'drop', expr: JSON.stringify(['bocloud_inspurcloud_host_nicDropPercent{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']), name: "['网络丢包百分比']", unit: '%' }
      ],
      dashboradData: {
        byte: {},
        drop: {}
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
