<template>
  <div>
    <!-- <detail-map :detail="detailData" :list="detailMapList"></detail-map> -->
    <el-row :gutter="20">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
      </el-col>
    </el-row>
  </div>
</template>
<script>
// import detailMap from 'views/components/detailMap.vue'
import { getCharts, getHostMem } from 'services/monitor'
import chartBox from 'views/components/chartBox.vue'
export default {
  components: { chartBox },
  props: {
    detailId: {
      type: Number
    },
    detailName: {
      type: String
    },
    uuid: {
      type: String
    }
  },
  data() {
    return {
      typeData: [{ title: '内存利用率', value: 'usage', expr: JSON.stringify(['round(bocloud_zstack_host_mem_util{instance_id="' + this.uuid + '"},0.01)']), name: "['内存利用率']", unit: '%' }],
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
        }
      })
    }
  },
  created() {
    // this.getDetail();
    for (const key in this.dashboradData) {
      const element = this.dashboradData[key]
      this.$set(element, 'step', null)
      this.$set(element, 'stepValue', 20)
      this.$set(element, 'defindTime', [])
    }
  }
}
</script>
