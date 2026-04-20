<template>
  <el-row class="full-height">
    <el-col :span="8">
      <div class="cell" v-for="(item, index) in countData" :key="item.name" :style="{ borderColor: colorMap[index] }">
        <span>{{ item.name }}</span>
        <span :style="{ color: colorMap[index] }">{{ item.value }}</span>
      </div>
    </el-col>
    <el-col :span="16" class="full-height">
      <!-- TODO: i18n -->
      <span class="chart-title">近七日告警趋势统计</span>
      <div style="height: calc(100% - 15px)">
        <!-- TODO: cmp-echarts - 后续用本地 echarts 组件替换 -->
        <line-charts :ref="`line${itemData.i}`" :data="lineData" width="100%" height="100%" :setting="chartSetting"></line-charts>
      </div>
    </el-col>
  </el-row>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { getAlarmCount } from 'services/system/portal'

interface CountItem {
  name: string
  value: number | string
}

const chartSetting = {
  color: ['#E03B3B', '#F09C2B', '#049BD3', '#1E54DE'],
  series: {
    areaStyle: {
      opacity: 0.4
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
defineProps<{
  itemData: { data?: any; i?: string }
}>()

const countData = ref<CountItem[]>([])
;(async function () {
  const res = await getAlarmCount({ action: 'pieChart' })
  countData.value = res.data
})()

const lineData = ref<Record<string, any>>({})
;(async function () {
  const end = new Date().setHours(0, 0, 0, 0) / 1000
  // 一天是86400秒
  const res = await getAlarmCount({ action: 'barChart', start: end - 86400 * 7, end })
  lineData.value = res.data
})()

const colorMap = chartSetting.color
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
</style>
