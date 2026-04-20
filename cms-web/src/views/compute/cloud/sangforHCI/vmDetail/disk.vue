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

    uuid: {
      type: String
    },
    detailUuid: {
      type: String
    }
  },
  data() {
    return {
      detailData: {},
      typeData: [
        {
          title: '磁盘读写速率',
          value: 'usage',
          expr: JSON.stringify(['round(bocloud_sangfor_hci_vm_disk{instanceId="' + this.detailUuid + '"},0.01)']),
          name: '["磁盘读写速率"]',
          unit: 'KB/s'
        }
      ],
      dashboradData: {
        usage: {}
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
