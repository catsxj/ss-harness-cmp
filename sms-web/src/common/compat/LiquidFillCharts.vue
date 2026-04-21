<template>
  <div :id="id" ref="rootRef" :style="{ width, height }"></div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { EChartsOption } from 'echarts'
import { useChart } from './useChart'
import 'echarts-liquidfill'

const props = withDefaults(
  defineProps<{
    id?: string
    data?: number | string | { value?: number } | null
    height?: string
    width?: string
    options?: EChartsOption
    setting?: Record<string, any>
  }>(),
  { height: '300px', width: '200px', options: () => ({}), setting: () => ({}) }
)

const rootRef = ref<HTMLElement | null>(null)

const { render } = useChart(rootRef, () => {
  const d = props.data
  if (d === null || d === undefined) return null
  const value = typeof d === 'object' ? Number((d as any).value) : Number(d)
  if (Number.isNaN(value)) return null
  const normalized = value > 1 ? value / 100 : value

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
    ...(props.options as any)
  } as EChartsOption
})

watch(() => props.data, render, { deep: true })
watch(() => props.options, render, { deep: true })
watch(() => props.setting, render, { deep: true })
</script>
