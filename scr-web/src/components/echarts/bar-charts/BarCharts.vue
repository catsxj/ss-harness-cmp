<template>
     <div :style="{height:height,width:width}" class="chart-container">
    <div class="chart" :class="{hide: isNoData}" :id="id" style="width: 100%;height: 100%"></div>
    <NoData  v-show="isNoData" class="chart-no-data"></NoData>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useEcharts, getLinerColor, defaultEchartsProps } from '../useEcharts'
import { yAxis, xAxis, grid } from '../defaultSetting'
import type { EChartsType } from 'echarts'

const props = defineProps({
  ...defaultEchartsProps,
  is3d: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  (e: 'goToPage', params: Record<string, unknown>): void
}>()

const isNoData = computed(() => {
  const d = props.data as Record<string, unknown[]>
  return !d?.keys || !d.keys.length
})

function updateChart(chartInstance: EChartsType) {
  if (!props.data) return
  const legends: string[] = []
  const series: Record<string, unknown>[] = []
  const setting = props.setting as Record<string, unknown>
  const { colorMap = {}, linerColor, axisLabel = {}, showSeriesLabel = true } = setting as Record<string, unknown>
  const color = (linerColor as string[][] | undefined)?.map((item: string[]) => {
    return getLinerColor(item[0], item[1])
  })
  const d = props.data as Record<string, unknown>
  const { values = [], keys = [] } = d
  const { showLegend = false } = setting
  ;(values as Array<{ name: string; data: unknown[] }>).forEach((item) => {
    legends.push(item.name)
    const data = item.data.map((cell) => {
      return {
        value: cell,
        itemStyle: {
          color: (colorMap as Record<string, string>)[item.name],
        },
      }
    })
    series.push({
      name: item.name,
      type: 'bar',
      smooth: true,
      stack: 'all',
      barMaxWidth: 30,
      label: {
        show: showSeriesLabel,
        position: 'top',
        color: '#fff',
      },
      itemStyle: {},
      data,
      zlevel: 11,
    })
    if (props.is3d) {
      series.push(
        {
          type: 'bar',
          barWidth: 8,
          itemStyle: {
            normal: {
              color,
            },
          },
          barGap: 0,
          data,
        },
        {
          name: 'b',
          tooltip: {
            show: false,
          },
          type: 'pictorialBar',
          itemStyle: {
            borderWidth: 1,
            borderColor: (color as unknown[])?.[0],
            color: (color as unknown[])?.[0],
          },
          symbol: 'path://M 0,0 l 120,0 l -30,60 l -120,0 z',
          symbolSize: ['30', '12'],
          symbolOffset: ['0', '-8'],
          symbolRotate: 5,
          symbolPosition: 'end',
          data,
          z: 3,
        }
      )
    }
  })
  const options = {
    color,
    legend: {
      show: showLegend,
      top: 0,
      textStyle: {
        color: '#fff',
      },
    },
    title: {
      text: (d as Record<string, unknown>).title,
    },
    tooltip: {
      trigger: 'axis',
      ...((setting.tooltip as Record<string, unknown>) || {}),
    },
    toolbox: setting.toolbox,
    grid: {
      ...grid,
      top: 30,
      left: '1%',
      right: '5%',
      bottom: 1,
    },
    xAxis: [
      {
        ...xAxis,
        type: 'category',
        name: props.unit,
        splitLine: {
          show: false,
        },
        axisLabel: {
          color: '#fff',
          interval: 0,
          ...(axisLabel as Record<string, unknown>),
        },
        axisTick: {
          show: false,
        },
        data: (keys as string[]).map((item) => {
          return item.replace(' ', '\n')
        }),
      },
    ],
    yAxis: [
      {
        ...yAxis,
        type: 'value',
        splitLine: {
          show: false,
        },
        axisLabel: {
          color: '#fff',
        },
        splitArea: {
          show: false,
          areaStyle: {
            color: ['rgba(255,255,255,1)', 'rgba(248,251,255,1)'],
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
<style lang="scss" scoped>
@import '../index';
</style>
