<template>
  <div ref="rootRef" :style="{ width, height }"></div>
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { useChart, type ChartSetting } from './useChart'
import 'echarts-liquidfill'

const props = withDefaults(
  defineProps<{
    id?: string
    data?: number | string | { value?: number } | null
    height?: string
    width?: string
    options?: EChartsOption
    setting?: ChartSetting
  }>(),
  { height: '300px', width: '200px', options: () => ({}), setting: () => ({}) }
)

const { rootRef } = useChart(
  (): EChartsOption | null => {
    const d = props.data
    if (d === null || d === undefined) return null
    const raw = typeof d === 'object' ? Number((d as any).value) : Number(d)
    if (Number.isNaN(raw)) return null
    const normalized = raw > 1 ? raw / 100 : raw

    return {
      series: [
        {
          type: 'liquidFill' as any,
          data: [normalized, normalized - 0.05, normalized - 0.1],
          radius: '90%',
          backgroundStyle: { color: '#eff6ff', borderWidth: 0 },
          outline: { show: false },
          color: ['#2563eb', '#3b82f6', '#60a5fa'],
          label: {
            color: '#0f172a',
            fontSize: 22,
            fontWeight: 600,
            formatter: () => `${Math.round(normalized * 100)}%`
          },
          ...(props.setting?.series || {})
        }
      ],
      ...props.options
    }
  },
  [() => props.data, () => props.setting, () => props.options]
)
</script>
