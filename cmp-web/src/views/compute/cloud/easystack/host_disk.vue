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
import { init } from 'views/components/util.js'
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
          title: '磁盘读取速率',
          value: 'first',
          expr: JSON.stringify(['round(irate(node_disk_read_bytes_total{host_id="' + this.detailId + '",device=~"df[a-zA-Z]*|sd[a-zA-Z]*|vd[a-zA-Z]*|hd[a-zA-Z]*|nvme.*"}[5m])/1024,0.01)']),
          name: '["$device"]',
          unit: 'KB/s'
        },
        {
          title: '磁盘写入速率',
          value: 'second',
          expr: JSON.stringify(['round(irate(node_disk_written_bytes_total{host_id="' + this.detailId + '",device=~"df[a-zA-Z]*|sd[a-zA-Z]*|vd[a-zA-Z]*|hd[a-zA-Z]*|nvme.*"}[5m])/1024,0.01)']),
          name: '["$device"]',
          unit: 'KB/s'
        },
        {
          title: '磁盘读取操作速率',
          value: 'third',
          expr: JSON.stringify(['round(irate(node_disk_reads_completed_total{host_id="' + this.detailId + '",device=~"df[a-zA-Z]*|sd[a-zA-Z]*|vd[a-zA-Z]*|hd[a-zA-Z]*|nvme.*"}[5m]),0.01)']),
          name: '["$device"]',
          unit: 'IO/s'
        },
        {
          title: '磁盘写入操作速率',
          value: 'fourth',
          expr: JSON.stringify(['round(irate(node_disk_writes_completed_total{host_id="' + this.detailId + '",device=~"df[a-zA-Z]*|sd[a-zA-Z]*|vd[a-zA-Z]*|hd[a-zA-Z]*|nvme.*"}[5m]),0.01)']),
          name: '["$device"]',
          unit: 'IO/s'
        }
      ],
      dashboradData: {
        first: {},
        second: {},
        third: {},
        fourth: {}
      }
    }
  },
  beforeDestroy() {},
  methods: {},
  created() {
    init(this.dashboradData, this)
  }
}
</script>
<style></style>
