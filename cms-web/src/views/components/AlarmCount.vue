<template>
  <el-row class="full-height">
    <el-col :span="8">
      <div class="cell" v-for="(item, index) in countData" :key="item.name" :style="{ borderColor: colorMap[index] }">
        <span>{{ item.name }}</span>
        <span :style="{ color: colorMap[index] }">{{ item.value }}</span>
      </div>
    </el-col>
    <el-col :span="16" class="full-height">
      <span class="chart-title">近七日告警趋势统计</span>
      <div style="height: calc(100% - 15px)">
        <line-charts ref="line1" v-if="lineData" :data="lineData" width="100%" height="100%" :setting="chartSetting"></line-charts>
      </div>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { ref, defineComponent, PropType } from '@vue/composition-api'
import { getAlarmChart } from 'services/monitor/index'

const chartSetting = {
  color: ['#E03B3B', '#F09C2B', '#049BD3', '#1E54DE'],
  series: {
    areaStyle: {
      opacity: 0.4
    }
  }
}
export default defineComponent({
  props: {
    // itemData: {
    //   type: Object as PropType<{ data: any }>,
    //   required: true
    // }
  },
  setup(props, context) {
    const countData = ref([])
    ;(async function () {
      const res = await getAlarmChart({ action: 'pieChart' })
      countData.value = res.data
    })()
    const lineData = ref({})
    ;(async function () {
      const end = new Date().setHours(0, 0, 0, 0) / 1000
      // 一天是86400秒
      const res = await getAlarmChart({ action: 'barChart', start: end - 86400 * 7, end })
      lineData.value = res.data
    })()
    return {
      colorMap: chartSetting.color,
      chartSetting,
      countData,
      lineData
    }
  }
})
</script>
<style lang="scss" scoped>
.cell {
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: space-between;
  height: 44px;
  opacity: 1;
  background: #f2f4f8;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 12px;
  border-left: 3px solid #e03b3b;
  span:nth-child(2) {
    font-size: 18px;
    color: #e03b3b;
  }
}
.chart-title {
  font-size: 12px;
  margin-left: 15px;
}
.full-height {
  height: 100%;
}
</style>
