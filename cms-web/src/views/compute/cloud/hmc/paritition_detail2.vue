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
    detailUuid: {
      type: String
    }
  },
  data() {
    return {
      typeData: [
        {
          title: '存储实时读取速率',
          value: 'storagerb',
          expr: JSON.stringify(['bocloud_hmc_proc_partition_storage_rb{parentUuid="' + this.detailUuid + '"}']),
          name: '["$instanceUuid"]',
          unit: 'KB/s'
        },
        {
          title: '存储实时写入速率',
          value: 'storagewb',
          expr: JSON.stringify(['bocloud_hmc_proc_partition_storage_wb{parentUuid="' + this.detailUuid + '"}']),
          name: '["$instanceUuid"]',
          unit: 'KB/s'
        },
        {
          title: '处理器单元数',
          value: 'cpu',
          expr: JSON.stringify(['bocloud_hmc_proc_partition_cpu_max_unit{instanceUuid = "' + this.detailUuid + '"}', 'bocloud_hmc_proc_partition_cpu_utilized_unit{instanceUuid = "' + this.detailUuid + '"}']),
          name: "['总量', '已使用']",
          unit: '单元'
        }
      ],
      dashboradData: {
        cpu: {},
        storagerb: {},
        storagewb: {}
      }
    }
  },
  beforeDestroy() {
    clearInterval(this.storagerbInterval)
    clearInterval(this.storagewbInterval)
    clearInterval(this.cpuInterval)
  },
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
<style scoped></style>
