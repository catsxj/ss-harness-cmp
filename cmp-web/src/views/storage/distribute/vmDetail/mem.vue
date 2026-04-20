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
    identifier: {
      type: String
    },
    address: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        {
          title: '内存利用率',
          value: 'usage',
          expr: JSON.stringify(['vsphere_vm_mem_usage_average{vmname="' + this.identifier + '",vcenter="' + this.address + '"}']),
          name: '["内存利用率"]',
          unit: '%'
        },
        {
          title: '共享内存',
          value: 'share',
          expr: JSON.stringify(['1/1024*vsphere_vm_mem_shared_average{vmname="' + this.identifier + '",vcenter="' + this.address + '"}']),
          name: '["共享内存"]',
          unit: 'MB'
        },
        {
          title: '内存最大开销',
          value: 'overheadMax',
          expr: JSON.stringify(['1/1024*vsphere_vm_mem_overheadMax_average{vmname="' + this.identifier + '",vcenter="' + this.address + '"}']),
          name: '["内存最大开销"]',
          unit: 'MB'
        },
        {
          title: '内存开销',
          value: 'overhead',
          expr: JSON.stringify(['1/1024*vsphere_vm_mem_overhead_average{vmname="' + this.identifier + '",vcenter="' + this.address + '"}']),
          name: '["内存开销"]',
          unit: 'MB'
        }
      ],
      dashboradData: {
        usage: {},
        share: {},
        overheadMax: {},
        overhead: {}
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
