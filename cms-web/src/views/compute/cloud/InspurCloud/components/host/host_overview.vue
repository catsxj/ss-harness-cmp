<template>
  <div>
    <el-row :gutter="5">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <chart-box :params-data="chart" :item-data="paramsOverviewChart[chart.value]"></chart-box>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import chartBox from 'views/components/chartBox.vue'
export default {
  components: {
    chartBox
  },
  props: {
    detailId: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        {
          title: 'CPU利用率',
          value: 'cpu',
          expr: JSON.stringify(['bocloud_inspurcloud_host_cpuUsage{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: "['cpu利用率']",
          unit: '%'
        },
        {
          title: '内存利用率',
          value: 'mem',
          expr: JSON.stringify(['bocloud_inspurcloud_host_memoryUsage{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: "['内存利用率']",
          unit: '%'
        },
        {
          title: '网络流入流出速率',
          value: 'byte',
          expr: JSON.stringify(['bocloud_inspurcloud_host_nicByteIn{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}', 'bocloud_inspurcloud_host_nicByteOut{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: "['网络流入速率', '网络流出速率']",
          unit: 'KB/s'
        },
        {
          title: '磁盘使用率',
          value: 'disk',
          expr: JSON.stringify(['bocloud_inspurcloud_host_diskUsage{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: "['磁盘使用率']",
          unit: '%'
        }
      ],
      paramsOverviewChart: {
        cpu: {},
        mem: {},
        byte: {},
        disk: {}
      },
      userDefindTime: [],
      userDefindVisible: false,
      timeIntervalDashboard: ''
    }
  },
  methods: {},
  created() {
    for (const key in this.paramsOverviewChart) {
      const element = this.paramsOverviewChart[key]
      this.$set(element, 'step', null)
      this.$set(element, 'stepValue', 20)
      this.$set(element, 'defindTime', [])
    }
  }
}
</script>
