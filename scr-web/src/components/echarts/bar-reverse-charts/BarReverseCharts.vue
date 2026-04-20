<template>
  <div :class="className" :id="id" :style="{height:height,width:width}"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useEcharts, getLinerColor, defaultEchartsProps } from '../useEcharts'
import { yAxis, xAxis, grid } from '../defaultSetting'
import type { EChartsType } from 'echarts'

const props = defineProps({
  ...defaultEchartsProps,
})

const emit = defineEmits<{
  (e: 'goToPage', params: Record<string, unknown>): void
}>()

function updateChart(chartInstance: EChartsType) {
  if (!props.data) return
  const legends: string[] = []
  const series: Record<string, unknown>[] = []
  const setting = props.setting as Record<string, unknown>
  const barColorArr = Array.isArray(setting.barColor) ? setting.barColor : []
  const startColor = (barColorArr[0] as string) || '#8699FF'
  const endColor = (barColorArr[1] as string) || '#4B66FF'
  const { yAxisLabel = {}, showXAxis = true } = setting as Record<string, unknown>
  const d = props.data as Record<string, unknown>
  if (!d || !d.values || !d.keys) return
  ;(d.values as Array<{ name: string; data: unknown[] }>).forEach((item) => {
    legends.unshift(item.name)
    series.push({
      name: item.name,
      type: 'bar',
      smooth: true,
      stack: 'all',
      barMaxWidth: 11,
      itemStyle: {
        normal: {
          areaStyle: { type: 'default' },
          color: getLinerColor(startColor as string, endColor as string),
        },
      },
      data: [...item.data].reverse(),
      zlevel: 11,
    })
  })
  const options = {
    color: setting.color,
    title: {
      text: d.title,
    },
    tooltip: {
      trigger: 'axis',
    },
    toolbox: setting.toolbox,
    grid: {
      ...grid,
      top: 10,
      left: '1%',
      right: '5%',
    },
    xAxis: [
      {
        show: showXAxis,
        ...xAxis,
        type: 'value',
        name: props.unit,
        splitLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitArea: {
          show: false,
          areaStyle: {
            color: ['rgba(255,255,255,1)', 'rgba(248,251,255,1)'],
          },
        },
        axisLabel: {
          color: '#fff',
        },
      },
    ],
    yAxis: [
      {
        ...yAxis,
        type: 'category',
        data: (d.keys as string[]).map((item) => {
          return item.replace(' ', '\n')
        }),
        axisLine: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          color: '#ffffff',
          ...(yAxisLabel as Record<string, unknown>),
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(0,0,0,0.0)', 'rgba(250,250,250,0.05)'],
          },
        },
      },
    ],
    series: series,
  }
  chartInstance.setOption(options, true)
}

const { chart } = useEcharts(props, updateChart)

onMounted(() => {
  if (chart.value) {
    chart.value.on('click', (params: Record<string, unknown>) => {
      const event = (params.event as Record<string, unknown>)?.event as Event
      event?.stopPropagation()
      emit('goToPage', params)
    })
  }
})
</script>
