<template>
  <div :class="className" :style="{height:height,width:width}" :id="id"></div>
</template>

<script setup lang="ts">
import { useEcharts, defaultEchartsProps } from '../useEcharts'
import type { EChartsType } from 'echarts'

const props = defineProps({
  ...defaultEchartsProps,
})

function updateChart(chartInstance: EChartsType) {
  const setting = props.setting as Record<string, unknown>
  const series = [
    {
      type: 'gauge',
      center: ['50%', '55%'],
      radius: '90%',
      axisLine: {
        lineStyle: {
          width: 5,
        },
      },
      axisTick: {
        length: 15,
        lineStyle: {
          color: 'auto',
        },
      },
      splitLine: {
        length: 10,
        lineStyle: {
          color: 'auto',
        },
      },
      title: {
        fontWeight: 'bolder',
        fontSize: 18,
        color: '#fff',
      },
      axisLabel: {
        fontSize: 8,
      },
      detail: {
        fontSize: 16,
      },
      data: props.data,
    },
  ]
  const options = {
    tooltip: {
      formatter: '{a} <br/>{c} {b}',
    },
    toolbox: setting.toolbox,
    series: series,
  }
  chartInstance.setOption(options, true)
}

useEcharts(props, updateChart)
</script>
