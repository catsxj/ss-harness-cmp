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
          title: '磁盘使用率',
          value: 'one',
          expr: JSON.stringify(['bocloud_inspurcloud_disk_diskUsage{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: '["磁盘使用率"]',
          unit: '%'
        },
        {
          title: '磁盘读操作速率',
          value: 'two',
          expr: JSON.stringify(['bocloud_inspurcloud_disk_diskReadThroughput{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: '["磁盘写操作速率"]',
          unit: 'IO/s'
        },
        {
          title: '磁盘写操作速率',
          value: 'three',
          expr: JSON.stringify(['bocloud_inspurcloud__disk_diskWriteThroughput{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: '["磁盘写操作速率"]',
          unit: 'IO/s'
        },
        {
          title: '云硬盘写IOPS',
          value: 'four',
          expr: JSON.stringify(['bocloud_inspurcloud_disk_diskWriteIops{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: '["云硬盘写IOPS"]',
          unit: 'kb/s'
        },
        {
          title: '云硬盘读IOPS',
          value: 'five',
          expr: JSON.stringify(['bocloud_inspurcloud_disk_diskReadIops{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: '["云硬盘读IOPS"]',
          unit: 'kb/s'
        },
        {
          title: '云硬盘写入',
          value: 'six',
          expr: JSON.stringify(['bocloud_inspurcloud_disk_diskIoWrite{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: '["云硬盘写入"]',
          unit: 'kb/s'
        },
        {
          title: '云硬盘读出',
          value: 'seven',
          expr: JSON.stringify(['bocloud_inspurcloud_disk_diskIoRead{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: '["云硬盘读出"]',
          unit: 'kb/s'
        }
      ],
      dashboradData: {
        one: {},
        two: {},
        three: {},
        four: {},
        five: {},
        six: {},
        seven: {}
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
