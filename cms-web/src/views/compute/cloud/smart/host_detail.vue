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
    detailName: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        {
          title: 'CPU利用率',
          value: 'cpu',
          expr: JSON.stringify(['round(smartx_host_cpu_overall_usage_percent{name="' + this.detailName + '"}, 0.01)']),
          name: "['CPU利用率']",
          unit: '%'
        },
        {
          title: '内存利用率',
          value: 'memory',
          expr: JSON.stringify(['round(smartx_host_memory_usage_percent{name="' + this.detailName + '"}, 0.01)']),
          name: "['内存利用率']",
          unit: '%'
        },
        {
          title: '内存使用量',
          value: 'memory_used',
          expr: JSON.stringify([`round(smartx_host_memory_used_bytes{name="${this.detailName}"}, 0.01)`]),
          name: "['内存使用量']",
          unit: 'bytes'
        },
        {
          title: 'IOPS读写',
          value: 'iops',
          expr: JSON.stringify([`round(smartx_zbs_chunk_read_iops{name="${this.detailName}"},0.01)`, `round(smartx_zbs_chunk_write_iops{name="${this.detailName}"},0.01)`]),
          name: '["IOPS读", "IOPS写"]',
          unit: 'Count/Second'
        },
        {
          title: 'I/O读写带宽',
          value: 'io',
          expr: JSON.stringify([`round(smartx_zbs_chunk_read_speed_bps{name="${this.detailName}"},0.01)`, `round(smartx_zbs_chunk_write_speed_bps{name="${this.detailName}"},0.01)`]),
          name: '["I/O读带宽", "I/O写带宽"]',
          unit: 'bps'
        },
        {
          title: '网口数据接收发送总量',
          value: 'network_bytes',
          expr: JSON.stringify([`sum(smartx_host_network_receive_bytes{name="${this.detailName}"})`, `sum(smartx_host_network_transmit_bytes{name="${this.detailName}"})`]),
          name: "['网口数据接收总量', '网口数据发送总量']",
          unit: 'bytes'
        },
        {
          title: '网口数据接收发送速度',
          value: 'network_speed',
          expr: JSON.stringify([`sum(smartx_host_network_receive_speed_bps{name="${this.detailName}"})`, `sum(smartx_host_network_transmit_speed_bps{name="${this.detailName}"})`]),
          name: "['网口数据接收速度', '网口数据发送速度']",
          unit: 'bps'
        },
        {
          title: 'I/O平均读写延迟',
          value: 'io_latency',
          expr: JSON.stringify([`smartx_zbs_chunk_avg_read_latency_ns{name="${this.detailName}"}`, `smartx_zbs_chunk_avg_write_latency_ns{name="${this.detailName}"}`]),
          name: "['I/O平均读延迟', 'I/O平均写延迟']",
          unit: 'ns'
        },
        {
          title: '分配给云主机的逻辑核数',
          value: 'vcpus_provisioned',
          expr: JSON.stringify([`round(smartx_elf_host_vcpus_provisioned{name="${this.detailName}"}, 0.01)`]),
          name: "['分配给云主机的逻辑核数']",
          unit: '核'
        },
        {
          title: '分配给云主机的内存大小',
          value: 'memory_provisioned',
          expr: JSON.stringify([`round(smartx_elf_host_memory_provisioned_bytes{name="${this.detailName}"}, 0.01)`]),
          name: "['分配给云主机的内存大小']",
          unit: 'bytes'
        }
      ],
      dashboradData: {
        cpu: {},
        memory: {},
        ipos: {},
        io: {},
        network_bytes: {},
        network_speed: {},
        io_latency: {},
        vcpus_provisioned: {},
        memory_provisioned: {},
        memory_used: {}
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
  },
  beforeDestroy() {}
}
</script>
<style></style>
