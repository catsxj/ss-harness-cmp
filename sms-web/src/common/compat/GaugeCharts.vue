<template>
  <div ref="rootRef" :style="{ width, height }"></div>
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { useChart } from './useChart'

interface GaugeData {
  min?: number
  max?: number
  data?: { name: string; value: number | string }
}

const props = withDefaults(
  defineProps<{
    id?: string
    data?: GaugeData | null
    height?: string
    width?: string
    options?: EChartsOption
  }>(),
  { height: '300px', width: '200px', options: () => ({}) }
)

const { rootRef } = useChart(
  (): EChartsOption | null => {
    const d = props.data
    if (!d?.data) return null
    const min = d.min ?? 0
    const max = d.max ?? 100
    const value = Number(d.data.value)

    return {
      series: [
        {
          name: d.data.name,
          type: 'gauge',
          min,
          max,
          radius: '92%',
          progress: { show: true, width: 10 },
          axisLine: {
            lineStyle: {
              width: 10,
              color: [
                [0.6, '#059669'],
                [0.85, '#d97706'],
                [1, '#dc2626']
              ]
            }
          },
          pointer: { length: '60%', width: 3 },
          axisTick: { show: false },
          splitLine: { length: 8, lineStyle: { color: '#cbd2da', width: 1 } },
          axisLabel: { color: '#94a3b8', fontSize: 10, distance: -16 },
          title: { fontSize: 12, color: '#475569', offsetCenter: [0, '70%'] },
          detail: {
            valueAnimation: true,
            fontSize: 20,
            fontWeight: 600,
            color: '#0f172a',
            offsetCenter: [0, '35%'],
            formatter: '{value}%'
          },
          data: [{ name: d.data.name, value }]
        }
      ],
      ...props.options
    }
  },
  [() => props.data, () => props.options]
)
</script>
