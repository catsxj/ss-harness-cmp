<template>
  <el-row :gutter="5">
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
      type: [Number, String]
    },
    identifier: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        { title: '磁盘使用速率', value: 'usage', expr: JSON.stringify(['round(h3c_host_disk_usage{name="' + this.identifier + '"},0.01)']), name: "['磁盘使用速率']", unit: 'KB/s' }
        // {
        //   title: '磁盘读取/写入速率',
        //   value: 'disk',
        //   expr: JSON.stringify(['h3c_host_disk_read_stat{name="' + this.identifier + '"}', 'h3c_host_disk_write_request{name="' + this.identifier + '"}']),
        //   name: "['磁盘读取速率', '磁盘写入速率']",
        //   unit: 'KB/s'
        // }
      ],
      dashboradData: {
        usage: {},
        diskNumberReadAveraged: {},
        diskNumberWriteAveraged: {},
        disk: {}
      },
      userDefindVisible: false,
      userDefindTime: []
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
