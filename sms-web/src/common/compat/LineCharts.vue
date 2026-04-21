<template>
  <div :id="id" ref="rootRef" :style="{ width, height }"></div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { EChartsOption } from 'echarts'
import { useChart, DEFAULT_COLORS } from './useChart'

interface LineData {
  keys?: (string | number)[]
  values?: Array<{ name: string; data: number[] }>
}

const props = withDefaults(
  defineProps<{
    id?: string
    data?: LineData | null
    unit?: string
    height?: string
    width?: string
    setting?: Record<string, any>
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
    type: 'line' as const,
    data: v.data,
    smooth: true,
    symbol: 'circle',
    symbolSize: 5,
    ...(seriesSetting as any)
  }))

  return {
    color,
    tooltip: { trigger: 'axis' },
    legend: { show: d.values.length > 1, top: 0, ...legend },
    grid: { left: '3%', right: '4%', bottom: '3%', top: d.values.length > 1 ? 40 : 20, containLabel: true, ...grid },
    xAxis: {
      type: 'category',
      boundaryGap: false,
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
