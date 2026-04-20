<template>
  <div>
    <detail-map :detail="detailData" :list="detailMapList" v-if="isShow"></detail-map>
    <el-row :gutter="5">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import chartBox from 'views/components/chartBox.vue'
import { getOpenstackVm } from 'services/monitor'
import detailMap from 'views/components/detailMap.vue'
export default {
  components: { detailMap, chartBox },
  props: {
    detailId: {
      type: Number
    },
    instanceId: {
      type: String
    },
    isShow: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      typeData: [
        {
          title: 'CPU利用率',
          value: 'azure_vm_cpu_usage',
          expr: JSON.stringify(['round(azure_vm_cpu_usage{instance_id="' + this.instanceId + '"}, 0.01)']),
          name: "['CPU利用率']",
          unit: '%'
        },
        {
          title: '内存利用率',
          value: 'azure_vm_mem_usage',
          expr: JSON.stringify(['round(azure_vm_mem_usage{instance_id="' + this.instanceId + '"}, 0.01)']),
          name: "['内存利用率']",
          unit: '%'
        },
        {
          title: '系统盘每秒读取的字节数',
          value: 'azure_vm_os_disk_read_bytes',
          expr: JSON.stringify(['azure_vm_os_disk_read_bytes{instance_id="' + this.instanceId + '"}']),
          name: "['系统盘每秒读取的字节数']",
          unit: '字节/秒'
        },
        {
          title: '系统盘每秒写入的字节数',
          value: 'azure_vm_os_disk_write_bytes',
          expr: JSON.stringify(['azure_vm_os_disk_write_bytes{instance_id="' + this.instanceId + '"}']),
          name: "['系统盘每秒写入的字节数']",
          unit: '字节/秒'
        },
        {
          title: '数据盘每秒读取的字节数',
          value: 'azure_vm_data_disk_read_bytes',
          expr: JSON.stringify(['azure_vm_data_disk_read_bytes{instance_id="' + this.instanceId + '"}']),
          name: "['数据盘每秒读取的字节数']",
          unit: '字节/秒'
        },
        {
          title: '数据盘每秒写入的字节数',
          value: 'azure_vm_data_disk_write_bytes',
          expr: JSON.stringify(['azure_vm_data_disk_write_bytes{instance_id="' + this.instanceId + '"}']),
          name: "['数据盘每秒写入的字节数']",
          unit: '字节/秒'
        }
      ],
      detailData: {},
      detailMapList: [
        { name: 'IP', value: 'privateIps', unit: '', type: 'azure', value2: 'publicIps' },
        { name: '规格', value: 'spec' },
        { name: '创建时间', value: 'gmtCreate', unit: '' },
        { name: '操作系统', value: 'osCategory' }
      ],
      dashboradData: {
        azure_vm_cpu_usage: {},
        azure_vm_mem_usage: {},
        azure_vm_os_disk_read_bytes: {},
        azure_vm_os_disk_write_bytes: {},
        azure_vm_data_disk_read_bytes: {},
        azure_vm_data_disk_write_bytes: {}
      }
    }
  },
  methods: {
    getOverview() {
      getOpenstackVm(this.detailId).then((data) => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
          if (this.detailData.privateIps) this.detailData.privateIps = JSON.parse(this.detailData.privateIps)
          if (this.detailData.publicIps) this.detailData.publicIps = JSON.parse(this.detailData.publicIps)
          this.detailData.spec = (this.detailData.cpu ? this.detailData.cpu : 0) + 'C/' + (this.detailData.memory ? this.detailData.memory : 0) + 'GB/' + (this.detailData.disk == null ? 0 : this.detailData.disk) + 'GB'
        }
      })
    }
  },
  created() {
    this.getOverview()
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
