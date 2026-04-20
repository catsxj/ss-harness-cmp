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
          title: '网络速率',
          value: 'first',
          expr: JSON.stringify(['bocloud_fusioncloud_vm_nicByteIn{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}', 'bocloud_fusioncloud_vm_nicByteOut{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: '["网络流入速率", "网络流出速率"]',
          unit: 'KB/s'
        },
        {
          title: '网络平均带宽',
          value: 'second',
          expr: JSON.stringify(['bocloud_fusioncloud_vm_nicByteInOut{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: '["网络平均带宽"]',
          unit: 'KB/s'
        },
        {
          title: '网络丢包百分比',
          value: 'third',
          expr: JSON.stringify(['bocloud_fusioncloud_vm_nicDropPercent {id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: '["网络丢包百分比"]',
          unit: '%'
        }
      ],
      dashboradData: {
        first: {},
        second: {},
        third: {}
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
