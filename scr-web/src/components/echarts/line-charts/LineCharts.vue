<template>
    <div :class="className" :id="id" :style="{height:height,width:width}"></div>
</template>

<script setup lang="ts">
import { useEcharts, defaultEchartsProps } from '../useEcharts'
import { yAxis, xAxis } from '../defaultSetting'
import type { EChartsType } from 'echarts'

const props = defineProps({
  ...defaultEchartsProps,
})

function updateChart(chartInstance: EChartsType) {
  const axisColor = '#ffffff'
  const legends: string[] = []
  const series: Record<string, unknown>[] = []
  const setting = props.setting as Record<string, unknown>
  const { showLegend = true } = setting
  const d = props.data as Record<string, unknown>
  ;(d.values as Array<{ name: string; data: unknown[] }>).forEach((item) => {
    legends.push(item.name)
    series.push({
      name: item.name,
      type: 'line',
      symbol: 'none',
      smooth: true,
      areaStyle: {
        opacity: 0.3,
      },
      data: item.data,
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
      left: 1,
      right: 1,
      top: 30,
      bottom: 0,
      containLabel: true,
    },
    legend: {
      show: showLegend,
      type: 'scroll',
      padding: [0, 20],
      top: 0,
      data: legends,
      textStyle: {
        color: '#fff',
      },
    },
    xAxis: [
      {
        ...xAxis,
        type: 'category',
        data: (d.keys as string[]).map((item) => {
          return item.replace(' ', '\n')
        }),
        axisLabel: {
          color: axisColor || '#AAB3C0',
          rotate: setting.axisLabelRotate,
        },
        axisLine: {
          lineStyle: {
            color: '#ffffff',
          },
        },
        splitArea: {
          show: false,
          areaStyle: {
            color: ['rgba(255,255,255,1)', 'rgba(248,251,255,1)'],
          },
        },
      },
    ],
    yAxis: [
      {
        ...yAxis,
        name: props.unit,
        axisLabel: {
          color: axisColor || '#AAB3C0',
        },
        nameTextStyle: {
          color: axisColor || '#AAB3C0',
        },
        axisLine: {
          lineStyle: {
            color: '#ffffff',
          },
        },
        splitLine: {
          lineStyle: {
            type: 'solid',
            color: '#1B263D',
          },
        },
      },
    ],
    series: series,
  }
  chartInstance.setOption(options, true)
}

useEcharts(props, updateChart)
</script>
