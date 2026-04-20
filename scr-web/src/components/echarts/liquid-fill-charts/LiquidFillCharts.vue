<template>
    <div :class="className" :id="id" :style="{height:height,width:width}"></div>
</template>

<script setup lang="ts">
import { useEcharts, defaultEchartsProps } from '../useEcharts'
import 'echarts-liquidfill'
import type { EChartsType } from 'echarts'

const props = defineProps({
  ...defaultEchartsProps,
})

function updateChart(chartInstance: EChartsType) {
  const dataVal = props.data as number
  chartInstance.setOption({
    series: {
      type: 'liquidFill',
      radius: '90%',
      data: [dataVal, dataVal / 1 - 0.05],
      itemStyle: {
        shadowBlur: 0,
      },
      color: ['#0669D9', '#60BBFF'],
      label: {
        normal: {
          color: '#fff',
          textStyle: {
            fontSize: 30,
            fontFamily: 'helveticaNeue Thin',
          },
        },
      },
      backgroundStyle: {
        borderColor: '#1871C6',
        borderWidth: 1,
        color: '#2D1F61',
      },
      outline: {
        show: true,
      },
      phase: 0,
      period: 4000,
      waveLength: '100%',
      animationDurationUpdate: 2000,
    },
  })
}

useEcharts(props, updateChart)
</script>
