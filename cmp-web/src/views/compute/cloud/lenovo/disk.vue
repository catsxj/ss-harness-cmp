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
          title: '磁盘利用率',
          value: 'usage',
          expr: JSON.stringify(['bocloud_lenovo_vm_disk_usage{instanceId="' + this.instanceId + '"}']),
          name: '["磁盘利用率"]',
          unit: '%'
        },
        {
          title: '磁盘读取/写入速率',
          value: 'disk',
          expr: JSON.stringify([
            'bocloud_lenovo_vm_disk_read_speed{instanceId="' + this.instanceId + '"}',
            'bocloud_lenovo_vm_disk_write_speed{instanceId="' + this.instanceId + '"}'
          ]),
          name: '["磁盘读速率", "磁盘写速率"]',
          unit: 'byte/s'
        }
      ],
      dashboradData: {
        usage: {},
        disk: {}
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
