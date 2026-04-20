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
        { title: '磁盘使用率', value: 'usage', expr: JSON.stringify(['bocloud_fusioncloud_host_diskUsage{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']), name: "['磁盘使用率']", unit: '%' },
        {
          title: '磁盘IO读写入',
          value: 'ioOutIn',
          expr: JSON.stringify(['bocloud_fusioncloud_host_diskIoOut{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}', 'bocloud_fusioncloud_host_diskIoIn{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: "['磁盘IO读出', '磁盘IO写入']",
          unit: 'KB/s'
        },
        {
          title: '磁盘读写IOPS',
          value: 'iops',
          expr: JSON.stringify(['bocloud_fusioncloud_host_diskIopsRead{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}', 'bocloud_fusioncloud_host_diskIopsWrite{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: "['磁盘读IOPS', '磁盘写IOPS']",
          unit: 'IO/s'
        }
      ],
      dashboradData: {
        usage: {},
        ioOutIn: {},
        iops: {}
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
