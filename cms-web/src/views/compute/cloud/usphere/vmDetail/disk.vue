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
      typeData: [
        {
          title: '磁盘利用率',
          value: 'diskUsage',
          expr: JSON.stringify(['round(bocloud_uis_vm_disk{instanceId="' + this.detailUuid + '"},0.01)']),
          name: "['磁盘利用率']",
          unit: '%'
        },
        {
          title: '磁盘读写速率',
          value: 'diskIo',
          expr: JSON.stringify([
            'round(bocloud_uis_vm_disk_io_read{instanceId="' + this.detailUuid + '"},0.01)',
            'round(bocloud_uis_vm_disk_io_write{instanceId="' + this.detailUuid + '"},0.01)'
          ]),
          name: "['磁盘读取速率', '磁盘写入速率']",
          unit: 'KBps'
        }
      ],
      dashboradData: {
        diskUsage: {},
        diskIo: {}
      }
    }
  },
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
