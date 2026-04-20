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
    instanceId: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        {
          title: 'CPU利用率',
          value: 'cpu',
          expr: JSON.stringify([`round(smartx_elf_vm_cpu_overall_usage_percent{vm="${this.instanceId}"}, 0.01)`]),
          name: "['CPU利用率']",
          unit: '%'
        },
        {
          title: '内存利用率',
          value: 'memory',
          expr: JSON.stringify([`round(smartx_elf_vm_memory_usage_percent{vm="${this.instanceId}"}, 0.01)`]),
          name: "['内存利用率']",
          unit: '%'
        },
        {
          title: '内存使用量',
          value: 'memory_used',
          expr: JSON.stringify([`round(smartx_elf_vm_memory_used_bytes{vm="${this.instanceId}"}, 0.01)`]),
          name: "['内存使用量']",
          unit: 'bytes'
        },
        {
          title: 'IOPS读写',
          value: 'iops',
          expr: JSON.stringify([`round(smartx_elf_vm_disk_overall_read_iops{vm="${this.instanceId}"},0.01)`, `round(smartx_elf_vm_disk_overall_write_iops{vm="${this.instanceId}"},0.01)`]),
          name: '["IOPS读", "IOPS写"]',
          unit: 'Count/Second'
        },
        {
          title: 'I/O读写带宽',
          value: 'io',
          expr: JSON.stringify([`round(smartx_elf_vm_disk_overall_read_speed_bps{vm="${this.instanceId}"},0.01)`, `round(smartx_elf_vm_disk_overall_write_speed_bps{vm="${this.instanceId}"},0.01)`]),
          name: '["I/O读带宽", "I/O写带宽"]',
          unit: 'bps'
        },
        {
          title: '网口发包收包总量',
          value: 'network_packets',
          expr: JSON.stringify([`round(smartx_elf_vm_network_transmit_packets{vm="${this.instanceId}"},0.01)`, `round(smartx_elf_vm_network_receive_packets{vm="${this.instanceId}"},0.01)`]),
          name: "['网口发包总量', '网口收包总量']",
          unit: 'bytes'
        },
        {
          title: '网口收包发包Error总量',
          value: 'network_speed',
          expr: JSON.stringify([`round(smartx_elf_vm_network_receive_errors{vm="${this.instanceId}"},0.01)`, `round(smartx_elf_vm_network_transmit_errors{vm="${this.instanceId}"},0.01)`]),
          name: "['网口收包Error总量', '网口发包Error总量']",
          unit: 'bytes'
        },
        {
          title: '网口数据接收发送总量',
          value: 'network_bates',
          expr: JSON.stringify([`round(smartx_elf_vm_network_receive_bytes{vm="${this.instanceId}"},0.01)`, `round(smartx_elf_vm_network_transmit_bytes{vm="${this.instanceId}"},0.01)`]),
          name: "['网口数据接收总量', '网口数据发送总量']",
          unit: 'bytes'
        }
      ],
      dashboradData: {
        cpu: {},
        memory: {},
        iops: {},
        io: {},
        network_speed: {},
        network_packets: {},
        memory_used: {},
        network_bates: {}
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
