<template>
  <div>
    <detail-map :detail="detailData" :list="detailMapList"></detail-map>
    <el-row :gutter="5">
      <el-col :span="12" v-for="item in configs" :key="item.title">
        <monitor-charts :params="item.params" :title="item.title" :transform-unit="item.transformUnit"></monitor-charts>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import detailMap from 'views/components/detailMap.vue'
export default {
  components: { detailMap },
  props: {
    detailData: {
      type: Object
    },
    paramsStr: {
      type: String
    }
  },
  data() {
    return {
      configs: [
        {
          title: '容量历史监控',
          transformUnit: 'KB',
          params: {
            expr: [`round(xms_pool_used_kbyte{${this.paramsStr}},0.01)`],
            name: "['容量历史监控']",
            unit: 'KB'
          }
        },
        {
          title: 'IOPS',
          params: {
            expr: [`round(xms_pool_used_kbyte{${this.paramsStr}},0.01)`, `round(xms_pool_write_kbyte{${this.paramsStr}},0.01)`, `round(xms_pool_recovery_kbyte{${this.paramsStr}},0.01)`],
            name: "['读取', '写入', '恢复']",
            unit: 'IO/ps'
          }
        },
        {
          title: '带宽',
          params: {
            expr: [`round(xms_pool_read_bandwidth_kbyte{${this.paramsStr}})`, `round(xms_pool_write_bandwidth_kbyte{${this.paramsStr}})`, `round(xms_pool_recovery_bandwidth_kbyte{${this.paramsStr}})`],
            name: "['读取', '写入', '恢复']",
            unit: 'KB'
          }
        },
        {
          title: 'IO大小',
          params: {
            expr: [`xms_pool_read_bandwidth_kbyte/xms_pool_read_iops{${this.paramsStr}}`, `xms_pool_read_bandwidth_kbyte/xms_pool_write_iops{${this.paramsStr}}`, `xms_pool_read_bandwidth_kbyte/xms_pool_recovery_iops{${this.paramsStr}}`],
            name: "['读取', '写入', '恢复']",
            unit: 'IO/ps'
          }
        },
        {
          title: '延迟',
          params: {
            expr: [`xms_pool_read_latency_us{${this.paramsStr}}`, `xms_pool_read_latency_us{${this.paramsStr}}`],
            name: "['读取', '写入']",
            unit: 'us'
          }
        }
      ],
      detailMapList: [
        { name: '总容量', value: 'capacity', unit: 'GB' },
        { name: '已用容量', value: 'usedCapacity', unit: 'GB' }
      ]
    }
  },
  methods: {}
}
</script>
