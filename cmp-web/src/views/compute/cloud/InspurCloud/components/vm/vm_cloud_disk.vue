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
          title: '云硬盘利用率',
          value: 'first',
          expr: JSON.stringify(['bocloud_inspurcloud_vm_diskUsage{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: '["云硬盘利用率"]',
          unit: '%'
        },
        {
          title: '云硬盘IO',
          value: 'second',
          expr: JSON.stringify(['bocloud_inspurcloud_vm_diskIoIn{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}', 'bocloud_inspurcloud_vm_diskIoOut{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: '["云硬盘IO写入", "云硬盘IO读出"]',
          unit: 'KB/s'
        },
        {
          title: '云硬盘平均时延',
          value: 'third',
          expr: JSON.stringify(['bocloud_inspurcloud_vm_diskIowrTicks{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}', 'bocloud_inspurcloud_vm_diskIordTicks{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: '["云硬盘平均写时延", "云硬盘平均读时延"]',
          unit: 'ms'
        },
        {
          title: '云硬盘平均IO利用率',
          value: 'fourth',
          expr: JSON.stringify(['bocloud_inspurcloud_vm_diskTotTicks{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: '["云硬盘平均IO利用率"]',
          unit: '%'
        },
        {
          title: '磁盘操作速率',
          value: 'disk',
          expr: JSON.stringify(['bocloud_inspurcloud_vm_disk_read_requests_rate{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}', 'bocloud_inspurcloud_vm_disk_write_requests_rate{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: '["磁盘读操作速率", "磁盘写操作速率"]',
          unit: 'IO/s'
        }
      ],
      dashboradData: {
        first: {},
        second: {},
        third: {},
        fourth: {},
        disk: {}
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
