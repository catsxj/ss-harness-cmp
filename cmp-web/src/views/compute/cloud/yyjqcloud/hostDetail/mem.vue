<template>
  <div>
    <detail-map :detail="detailData" :list="detailMapList"></detail-map>
    <el-row :gutter="20">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import detailMap from 'views/components/detailMap.vue'
import { getCharts, getHostMem } from 'services/monitor'
import chartBox from 'views/components/chartBox.vue'
export default {
  components: { detailMap, chartBox },
  props: {
    detailId: {
      type: Number
    },
    detailName: {
      type: String
    },
    uuid: {
      type: String
    },
    instanceId: {
      type: String
    },
    vendorId: {
      type: Number
    }
  },
  data() {
    return {
      typeData: [{ title: '内存利用率', value: 'usage', expr: JSON.stringify(['round(yyjqcloud_host_memory_usage{instance_id="' + this.instanceId + '",vendor_id="' + this.vendorId + '"}, 0.01)']), name: "['内存利用率']", unit: '%' }],
      detailData: {},
      detailMapList: [
        { name: '内存总量', value: 'memTotalCapacity', unit: 'GB' },
        { name: '内存使用量', value: 'memUsed', unit: 'GB' },
        { name: '内存空闲量', value: 'memFree', unit: 'GB' }
      ],
      dashboradData: {
        usage: {}
      },
      userDefindVisible: false,
      userDefindTime: []
    }
  },
  methods: {
    getDetail() {
      getHostMem(this.detailId).then((data) => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
          // 保留两位小数
          this.detailData.memUsed = this.detailData.memUsed.toFixed(2)
        }
      })
    }
  },
  created() {
    this.getDetail()
    for (const key in this.dashboradData) {
      const element = this.dashboradData[key]
      this.$set(element, 'step', null)
      this.$set(element, 'stepValue', 20)
      this.$set(element, 'defindTime', [])
    }
  }
}
</script>
