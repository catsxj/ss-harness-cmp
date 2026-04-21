<template>
  <div :id="id" ref="rootRef" :style="{ width, height }"></div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { EChartsOption } from 'echarts'
import { useChart, DEFAULT_COLORS } from './useChart'

interface BarData {
  keys?: (string | number)[]
  values?: Array<{ name: string; data: number[] }>
}
interface Setting {
  color?: string[]
  colorMap?: Record<string, any>
  linerColor?: string
  legend?: Record<string, any>
  legendLength?: number
  xAxis?: Record<string, any>
  yAxis?: Record<string, any>
  grid?: Record<string, any>
  series?: Record<string, any>
  fixed?: number
}

const props = withDefaults(
  defineProps<{
    id?: string
    data?: BarData | null
    unit?: string
    height?: string
    width?: string
    setting?: Setting
    options?: EChartsOption
  }>(),
  { height: '300px', width: '200px', setting: () => ({}), options: () => ({}) }
)

const rootRef = ref<HTMLElement | null>(null)

const { render } = useChart(rootRef, () => {
  const d = props.data
  if (!d || !d.keys || !d.values) return null

  const { color = DEFAULT_COLORS, legend = {}, xAxis = {}, yAxis = {}, grid = {}, series: seriesSetting = {} } = props.setting || {}

  const series = d.values.map((v) => ({
    name: v.name,
    type: 'bar' as const,
    data: v.data,
    barMaxWidth: 24,
    ...(seriesSetting as any)
  }))

  return {
    color,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      show: d.values.length > 1,
      type: 'scroll',
      top: 0,
      ...legend
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: d.values.length > 1 ? 40 : 20, containLabel: true, ...grid },
    xAxis: {
      type: 'category',
      data: d.keys,
      axisLine: { lineStyle: { color: '#cbd2da' } },
      axisLabel: { color: '#475569', fontSize: 11 },
      ...xAxis
    },
    yAxis: {
      type: 'value',
      name: props.unit,
      nameTextStyle: { color: '#94a3b8', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#e4e7eb', type: 'dashed' } },
      axisLabel: { color: '#475569', fontSize: 11 },
      ...yAxis
    },
    series,
    ...(props.options as any)
  } as EChartsOption
})

watch(() => props.data, render, { deep: true })
watch(() => props.setting, render, { deep: true })
watch(() => props.options, render, { deep: true })
</script>
