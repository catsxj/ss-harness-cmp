<template>
  <div ref="rootRef" :style="{ width, height }"></div>
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import {
  useChart,
  DEFAULT_COLORS,
  AXIS_LINE,
  AXIS_LABEL,
  AXIS_NAME_TEXT,
  SPLIT_LINE_DASHED,
  type ChartSetting
} from './useChart'

interface BarData {
  keys?: string[]
  values?: Array<{ name: string; data: number[] }>
}

const props = withDefaults(
  defineProps<{
    id?: string
    data?: BarData | null
    unit?: string
    height?: string
    width?: string
    setting?: ChartSetting
    options?: EChartsOption
  }>(),
  { height: '300px', width: '200px', setting: () => ({}), options: () => ({}) }
)

const { rootRef } = useChart(
  (): EChartsOption | null => {
    const d = props.data
    if (!d?.keys || !d?.values) return null
    const { color = DEFAULT_COLORS, legend = {}, xAxis = {}, yAxis = {}, grid = {}, series: seriesSetting = {} } = props.setting || {}
    const multiSeries = d.values.length > 1

    return {
      color,
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { show: multiSeries, top: 0, ...legend },
      grid: { left: '3%', right: '4%', bottom: '3%', top: multiSeries ? 40 : 20, containLabel: true, ...grid },
      xAxis: {
        type: 'value',
        name: props.unit,
        nameTextStyle: AXIS_NAME_TEXT,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: SPLIT_LINE_DASHED,
        axisLabel: AXIS_LABEL,
        ...xAxis
      },
      yAxis: { type: 'category', data: d.keys, axisLine: AXIS_LINE, axisLabel: AXIS_LABEL, ...yAxis },
      series: d.values.map((v) => ({ name: v.name, type: 'bar', data: v.data, barMaxWidth: 20, ...seriesSetting })),
      ...props.options
    }
  },
  [() => props.data, () => props.setting, () => props.options]
)
</script>
