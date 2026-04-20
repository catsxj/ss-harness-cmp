<template>
    <div :class="className" :id="id" :style="{height:height,width:width}"></div>
</template>

<script setup lang="ts">
import { useEcharts, defaultEchartsProps } from '../useEcharts'
import type { EChartsType } from 'echarts'

const props = defineProps({
  ...defaultEchartsProps,
  wrapperId: {
    type: String,
  },
})

function updateChart(chartInstance: EChartsType) {
  if (!props.data) return
  const seriesArr: Record<string, unknown>[] = []
  const d = props.data as Array<{ name: string; value: number }>
  const total = d.reduce((totals, item) => {
    return totals + item.value / 1
  }, 0)
  const { unit } = props
  const setting = props.setting as Record<string, unknown>
  const { color = [], radius, offset = 200 } = setting
  const colorArr = color as string[]
  d.forEach((item, index) => {
    const textColor = colorArr[index] || '#3392FF'
    const centerX = 80 + index * (offset as number)
    seriesArr.push(
      {
        name: item.name,
        type: 'pie',
        radius: (radius as string[]) || ['43%', '54%'],
        center: [centerX, '50%'],
        z: 10,
        data: [
          {
            name: '',
            value: item.value,
            label: {
              normal: {
                rich: {
                  a: {
                    color: '#999999',
                    align: 'center',
                    fontSize: 12,
                  },
                  b: {
                    color: textColor,
                    align: 'center',
                    fontSize: 14,
                    fontWeight: 500,
                  },
                },
                formatter: function (params: Record<string, unknown>) {
                  return `{b|${params.value}${unit} ${params.percent}%}\n\n{a| ${params.seriesName}}`
                },
              },
            },
            itemStyle: {
              normal: {
                labelLine: {
                  show: false,
                },
                color: textColor,
              },
            },
          },
          {
            value: total - item.value,
            itemStyle: {
              color: 'transparent',
            },
          },
        ],
        label: {
          normal: {
            position: 'center',
          },
        },
      },
      {
        name: item.name,
        type: 'pie',
        radius: (radius as string[]) || ['45%', '52%'],
        itemStyle: {
          normal: {
            Label: {
              show: false,
            },
            labelLine: {
              show: false,
            },
            color: '#EBEBEB',
          },
        },
        center: [centerX, '50%'],
        data: [
          {
            value: item.value,
          },
          {
            value: total - item.value,
          },
        ],
      }
    )
  })
  const options = {
    color: colorArr,
    series: seriesArr,
  }
  chartInstance.setOption(options, true)
}

useEcharts(props, updateChart)
</script>
