<template>
   <div :style="{height:height,width:width}" class="chart-container">
    <div class="chart" :class="{hide: isNoData}" :id="id" style="width: 100%;height: 100%"></div>
    <NoData  v-show="isNoData" class="chart-no-data"></NoData>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEcharts, defaultEchartsProps } from '../useEcharts'
import type { EChartsType } from 'echarts'

const props = defineProps({
  ...defaultEchartsProps,
  theme: {
    type: String,
    default: '数值',
  },
  centerText: {
    type: String,
    default: '总数',
  },
})

const total = ref(0)

const isNoData = computed(() => {
  const d = props.data as unknown[] | null
  return !d || !d.length
})

function updateChart(chartInstance: EChartsType) {
  if (!props.data) return
  const { themeColor } = echartsReturn
  const legendColor = themeColor.value.legendColor
  const legends: string[] = []
  const setting = props.setting as Record<string, unknown>
  total.value = 0
  const countMap: Record<string, number> = {}
  const d = props.data as Array<{ name: string; value: number }>
  d.forEach((item) => {
    legends.push(item.name)
    total.value += item.value / 1
    countMap[item.name] = item.value >= 0 ? item.value : 0
  })
  total.value = Number(total.value.toFixed((setting.fixed as number) || 0))
  const unit = props.unit
  const centerText = props.centerText
  const totalVal = total.value
  const options = {
    color: setting.color,
    title: {
      text: (d as unknown as Record<string, unknown>).title,
    },
    tooltip: {
      trigger: 'item',
      confine: true,
      formatter: function (params: Record<string, unknown>) {
        const str =
          params.seriesName +
          '</br>' +
          params.name +
          ':' +
          ((params.data as Record<string, number>).value >= 0
            ? (params.data as Record<string, number>).value
            : 0) +
          (unit ? unit : '') +
          '(' +
          ((params.percent as number) >= 0 ? params.percent : 0) +
          '%)'
        return str
      },
    },
    legend: {
      data: legends,
      bottom: 0,
      itemGap: 15,
      formatter: (name: string) => {
        const { legendLength = 10 } = setting
        const resultName = `${name.substr(0, legendLength as number)}${name.length > (legendLength as number) ? '...' : ''}`
        return `{name|${resultName}}{count|${countMap[name]}${unit || ''}}`
      },
      textStyle: {
        rich: {
          name: {
            align: 'left',
            color: legendColor || '#666',
            width: 50,
          },
          count: {
            align: 'right',
            color: legendColor || '#7e7e7e',
            width: (setting.richCount as number) || 100,
            fontWeight: 600,
          },
        },
      },
      tooltip: {
        show: true,
      },
      ...(setting.legend as Record<string, unknown>),
    },
    toolbox: setting.toolbox,
    series: [
      {
        name: props.theme,
        type: 'pie',
        avoidLabelOverlap: false,
        hoverAnimation: false,
        label: {
          normal: {
            show: true,
            position: 'center',
            formatter: function () {
              return `{count|${centerText}\r\n\r\n${totalVal}${unit}}`
            },
            textStyle: {
              color: legendColor || '#5F6264',
            },
            rich: {
              count: {
                fontSize: 19,
                color: legendColor || '#5F6264',
              },
            },
          },
          emphasis: {
            show: false,
            textStyle: {
              fontSize: '14',
              fontWeight: 'bold',
            },
          },
        },
        radius: (setting.radius as string[]) || ['50%', '65%'],
        center: (setting.center as string[]) || ['50%', '50%'],
        data: d,
      },
    ],
  }
  chartInstance.setOption(options, true)
}

const echartsReturn = useEcharts(props, updateChart)
</script>
<style lang="scss" scoped>
@import '../index';
</style>
