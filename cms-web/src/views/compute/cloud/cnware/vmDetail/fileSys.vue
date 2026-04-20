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
      type: Number
    },
    detailUuid: {
      type: String
    },
    detailVendorId: {
      type: Number
    }
  },
  data() {
    return {
      typeData: [
        { title: '磁盘利用率', value: 'usedPercent', expr: JSON.stringify(['round(cnware_partition_disk_usedPercent{path!="",uuid="' + this.detailUuid + '",vendorId="' + this.detailVendorId + '"},0.01)']), name: '["$path"]', unit: '%' },
        { title: '磁盘使用量', value: 'used', expr: JSON.stringify(['round((cnware_partition_disk_capacity-cnware_partition_disk_freeSpace{path!="",uuid="' + this.detailUuid + '",vendorId="' + this.detailVendorId + '"})/1024)']), name: '["$path"]', unit: 'KB' }
      ],
      dashboradData: {
        used: {},
        usedPercent: {}
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
  }
}
</script>
