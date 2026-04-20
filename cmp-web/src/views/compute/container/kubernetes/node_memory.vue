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
    detailName: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        {
          title: '内存总量',
          value: 'total',
          expr: JSON.stringify(['round(node_memory_MemTotal_bytes{kubernetes_io_hostname="' + this.detailName + '"}/1024/1024/1024,0.01)']),
          name: '["内存总量"]',
          unit: 'GB'
        },
        {
          title: '内存空闲量',
          value: 'free',
          expr: JSON.stringify(['round(node_memory_MemFree_bytes{kubernetes_io_hostname="' + this.detailName + '"}/1024/1024/1024,0.01)']),
          name: '["内存空闲量"]',
          unit: 'GB'
        },
        {
          title: '内存使用量',
          value: 'used',
          expr: JSON.stringify([
            'round((node_memory_MemTotal_bytes{kubernetes_io_hostname="' +
              this.detailName +
              '"} - ' +
              'node_memory_MemFree_bytes{kubernetes_io_hostname="' +
              this.detailName +
              '"} - ' +
              '(node_memory_Cached_bytes{kubernetes_io_hostname="' +
              this.detailName +
              '"} + ' +
              'node_memory_Buffers_bytes{kubernetes_io_hostname="' +
              this.detailName +
              '"}))/1024/1024/1024,0.01)'
          ]),
          name: '["内存使用量"]',
          unit: 'GB'
        },
        {
          title: '缓存内存使用量',
          value: 'cached',
          expr: JSON.stringify(['round((node_memory_Cached_bytes{kubernetes_io_hostname="' + this.detailName + '"} + ' + 'node_memory_Buffers_bytes{kubernetes_io_hostname="' + this.detailName + '"})/1024/1024/1024,0.01)']),
          name: '["缓存内存使用量"]',
          unit: 'GB'
        }
      ],
      dashboradData: {
        total: {},
        free: {},
        used: {},
        cached: {}
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
