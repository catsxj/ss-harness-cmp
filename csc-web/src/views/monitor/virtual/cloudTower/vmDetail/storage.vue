<template>
  <el-row :gutter="20">
    <el-col :span="12" v-for="chart in typeData" :key="chart.value">
      <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
    </el-col>
  </el-row>
</template>
<script>
import chartBox from 'views/monitor/components/chartBox.vue'
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
        { title: 'IOPS-读', value: 'read', expr: JSON.stringify(['round(bocloud_cloudtower_vm_elf_vm_disk_overall_read_iops{id="' + this.detailId + '"}, 0.01)']), name: "['IOPS-读']", unit: 'IOPS' },
        { title: 'IOPS-写', value: 'write', expr: JSON.stringify(['round(bocloud_cloudtower_vm_elf_vm_disk_overall_write_iops{id="' + this.detailId + '"}, 0.01)']), name: "['IOPS-写']", unit: 'IOPS' }
      ],
      detailData: {},
      detailMapList: [
        { name: '磁盘总量', value: 'diskCapacity', unit: 'GB' },
        { name: '磁盘使用量', value: 'diskUsed', unit: 'GB' },
        { name: '磁盘空闲量', value: 'diskFree', unit: 'GB' }
      ],
      dashboradData: {
        read: {},
        write: {}
      }
    }
  },
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
