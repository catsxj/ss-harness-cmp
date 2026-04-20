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
    hostName: {
      type: String
    },
    detail: {
      type: Object
    }
  },
  data () {
    return {
      typeData: [
        {
          title: 'CPU利用率',
          value: 'usage',
          expr: JSON.stringify([
            // 'round(vsphere_vm_cpu_usage_average{cpu="instance-total",vmname="' + this.identifier + '",esxhostname="' + this.hostName + '"},0.01)'
            'round(bocloud_fusionsphere_vm_cpu_usage{vendorId="' + this.detail.vendorId + '",instance_id="' + this.detail.instanceId + '"},0.01)'
          ]),
          name: "['CPU利用率']",
          unit: '%'
        }
      ],
      dashboradData: {
        usage: {}
      }
    }
  },
  beforeDestroy () {
  },
  methods: {
  },
  created () {
    for (const key in this.dashboradData) {
      const element = this.dashboradData[key];
      this.$set(element, 'step', null)
      this.$set(element, 'stepValue', 20)
      this.$set(element, 'defindTime', [])
    }
  }
}
</script>
