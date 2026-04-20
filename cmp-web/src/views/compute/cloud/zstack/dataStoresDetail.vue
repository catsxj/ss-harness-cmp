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
const intervalData = [
  { name: '1H', value: '1H' },
  { name: '6H', value: '6H' },
  { name: '1D', value: '1D' },
  { name: '7D', value: '7D' },
  { name: '14D', value: '14D' }
]
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
      intervalData,
      typeData: [
        {
          title: '数据存储容量',
          value: 'capacity',
          expr: JSON.stringify([
            'round(vsphere_datastore_disk_capacity_latest{dsname="' + this.identifier + '",vcenter="' + this.address + '"}/1024/1024,0.01)',
            'round(vsphere_datastore_disk_used_latest{dsname="' + this.identifier + '",vcenter="' + this.address + '"}/1024/1024,0.01)',
            'round(vsphere_datastore_disk_provisioned_latest{dsname="' + this.identifier + '",vcenter="' + this.address + '"}/1024/1024,0.01)'
          ]),
          name: "['总量', '使用量', '置备空间']",
          unit: 'GB'
        },
        {
          title: '数据存储使用率',
          value: 'used',
          expr: JSON.stringify(['round(100*vsphere_datastore_disk_used_latest{dsname="' + this.identifier + '",vcenter="' + this.address + '"}/vsphere_datastore_disk_capacity_latest,0.01)']),
          name: "['使用率']",
          unit: '%'
        }
      ],
      dashboradData: {
        capacity: {},
        used: {}
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
