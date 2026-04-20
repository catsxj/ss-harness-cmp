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
    detailUuid: {
      type: String
    }
  },
  data() {
    return {
      detailData: {},
      // IO读次数 sangfor_vm_disk_iops_read
      // IO写次数 sangfor_vm_disk_iops_write
      // IO读速率 sangfor_vm_disk_speed_read
      // IO写速率 sangfor_vm_disk_speed_write
      typeData: [
        {
          title: 'IO读次数',
          value: 'iopsRead',
          expr: JSON.stringify(['round(sangfor_vm_disk_iops_read{instanceId="' + this.detailUuid + '"},0.01)']),
          name: '["IO读次数"]',
          unit: '次/s'
        },
        {
          title: 'IO写次数',
          value: 'iopsWrite',
          expr: JSON.stringify(['round(sangfor_vm_disk_iops_write{instanceId="' + this.detailUuid + '"},0.01)']),
          name: '["IO写次数"]',
          unit: '次/s'
        },
        {
          title: 'IO读速率',
          value: 'speedRead',
          expr: JSON.stringify(['round(sangfor_vm_disk_speed_read{instanceId="' + this.detailUuid + '"},0.01)']),
          name: '["IO读速率"]',
          unit: 'KB/s'
        },
        {
          title: 'IO写速率',
          value: 'speedWrite',
          expr: JSON.stringify(['round(sangfor_vm_disk_speed_write{instanceId="' + this.detailUuid + '"},0.01)']),
          name: '["IO写速率"]',
          unit: 'KB/s'
        }
      ],
      dashboradData: {
        iopsRead: {},
        iopsWrite: {},
        speedRead: {},
        speedWrite: {}
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
