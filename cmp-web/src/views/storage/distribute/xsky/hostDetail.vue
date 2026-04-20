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
          title: 'CPU利用率',
          params: {
            expr: [`round(xms_host_cpu_util{${this.paramsStr}} * 100, 0.01)`],
            name: "['CPU利用率']",
            unit: '%'
          }
        },
        {
          title: '内存利用率',
          params: {
            expr: [`round(xms_host_mem_usage_percent{${this.paramsStr}} * 100, 0.01)`],
            name: "['内存利用率']",
            unit: '%'
          }
        },
        {
          title: '网络带宽',
          transformUnit: 'KB',
          params: {
            expr: [`xms_host_network_rx_bandwidth_kbyte{${this.paramsStr}}`, `xms_host_network_tx_bandwidth_kbyte{${this.paramsStr}}`],
            name: "['接收', '发送']",
            unit: 'KB'
          }
        },
        {
          title: '数据包',
          params: {
            expr: [`xms_host_network_rx_pps{${this.paramsStr}}`, `xms_host_network_tx_pps{${this.paramsStr}}`],
            name: "['收包数', '发包数']",
            unit: 'packages/ps'
          }
        },
        {
          title: '丢包数',
          params: {
            expr: [`xms_host_network_rx_drop_pps{${this.paramsStr}} + xms_host_network_tx_drop_pps`],
            name: "['丢包数']",
            unit: 'packages/ps'
          }
        },
        {
          title: '错误包',
          params: {
            expr: [`xms_host_network_rx_error_pps{${this.paramsStr}} + xms_host_network_tx_error_pps`],
            name: "['错误包']",
            unit: 'packages/ps'
          }
        },
        {
          title: '平均负载',
          params: {
            expr: [`xms_host_load1min{${this.paramsStr}}`, `xms_host_load5min{${this.paramsStr}}`, `xms_host_load15min{${this.paramsStr}}`],
            name: "['1分钟', '5分钟', '15分钟']",
            unit: ''
          }
        }
      ],
      detailMapList: [
        { name: 'IP地址', value: 'manageIp', unit: '' },
        { name: 'CPU使用量', value: 'cpuUsage', unit: '%' },
        { name: '内存使用量', value: 'memUsage', unit: '%' }
      ]
    }
  },
  methods: {}
}
</script>
