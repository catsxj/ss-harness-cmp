<template>
  <div ref="rootRef" :style="{ width, height }"></div>
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { useChart, DEFAULT_COLORS, type ChartSetting } from './useChart'

interface PieItem { name: string; value: number | string }
type PieData = PieItem[] | { rows?: PieItem[]; keys?: string[]; values?: Array<{ name: string; data: number[] }>; [key: string]: any } | null

const props = withDefaults(
  defineProps<{
    id?: string
    theme?: string
    data?: PieData
    unit?: string
    height?: string
    width?: string
    setting?: ChartSetting
    options?: EChartsOption
  }>(),
  { height: '300px', width: '200px', setting: () => ({}), options: () => ({}) }
)

function normalizeData(d: any): PieItem[] {
  if (!d) return []
  if (Array.isArray(d)) return d
  if (Array.isArray(d.rows)) return d.rows
  if (Array.isArray(d.keys) && Array.isArray(d.values)) {
    const firstSeries = d.values[0]?.data || []
    return d.keys.map((k: string, i: number) => ({ name: k, value: firstSeries[i] ?? 0 }))
  }
  return []
}

const { rootRef } = useChart(
  (): EChartsOption | null => {
    const items = normalizeData(props.data)
    if (!items.length) return null
    const {
      color = DEFAULT_COLORS,
      legend = {},
      series: seriesSetting = {},
      radius = ['50%', '65%'],
      center = ['50%', '50%']
    } = props.setting || {}

    return {
      color,
      tooltip: {
        trigger: 'item',
        formatter: (p: any) => `${props.theme || ''}${p.name}: ${p.value}${props.unit || ''} (${p.percent}%)`
      },
      legend: {
        show: true,
        orient: 'vertical',
        right: 0,
        top: 'middle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: '#475569', fontSize: 11 },
        ...legend
      },
      series: [
        {
          name: props.theme || '',
          type: 'pie',
          radius,
          center,
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          data: items,
          ...seriesSetting
        }
      ],
      ...props.options
    }
  },
  [() => props.data, () => props.setting, () => props.options]
)
</script>
