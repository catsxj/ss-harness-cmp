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
    uuid: {
      type: String
    },
    instanceId: {
      type: String
    }
  },
  data() {
    return {
      detailData: {},
      typeData: [{ title: '磁盘使用速率', value: 'usage', expr: JSON.stringify(['round(bocloud_zstack_vm_disk_util_rate{instance_id="' + this.instanceId + '"},0.01)']), name: '["磁盘使用速率"]', unit: 'KB/s' }],
      dashboradData: {
        usage: {},
        diskNumberAveraged: {},
        disk: {}
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
  }
}
</script>
