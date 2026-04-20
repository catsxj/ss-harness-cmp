<template>
  <div :style="{height:height,width:width}" class="chart-container">
    <div class="chart" :class="{hide: isNoData}" :id="id" style="width: 100%;height: 100%"></div>
    <div key="no-data" v-show="isNoData" class="chart-no-data">
      <i class="iconfont icon-zanwushuju" />
      <span>暂无数据</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEcharts, getLinerColor, defaultEchartsProps } from '../useEcharts'
import { legend } from '../defaultSetting'
import type { EChartsType } from 'echarts'

const props = defineProps({
  ...defaultEchartsProps,
})

const total = ref(0)

const isNoData = computed(() => {
  const d = props.data as unknown[] | null
  return !d || !d.length
})

function updateChart(chartInstance: EChartsType) {
  if (!props.data) return
  const setting = props.setting as Record<string, unknown>
  const { linerColor, colorMap = {} } = setting
  const legends: string[] = []
  const d = props.data as Array<{ name: string; value: number; itemStyle?: Record<string, unknown> }>
  d.forEach((item) => {
    legends.push(item.name)
    item.itemStyle = {
      color: (colorMap as Record<string, string>)[item.name],
    }
  })
  const color =
    (linerColor as string[][] | undefined)?.map((item: string[]) => {
      return getLinerColor(item[0], item[1])
    }) || undefined
  const unit = props.unit
  const options = {
    color: color || ['#F84540', '#FF9900', '#2D8CF0', '#19BE6B', '#696BD8', '#D4D5E7'],
    tooltip: {
      trigger: 'item',
      formatter: `{a} <br/>{b} : {c}${unit || ''} ({d}%)`,
    },
    legend: {
      ...legend,
      data: legends,
      bottom: 0,
      itemGap: 20,
      ...(setting.legend as Record<string, unknown>),
    },
    toolbox: setting.toolbox,
    series: [
      {
        name: props.theme,
        type: 'pie',
        radius: '80%',
        roseType: 'radius',
        center: (setting.center as string[]) || ['50%', '50%'],
        data: d,
        label: {
          normal: {
            formatter: ['{c|{c}' + unit + '}'].join('\n'),
            rich: {
              c: {
                color: '#CED1DE',
                fontSize: 12,
                fontWeight: 400,
              },
            },
          },
        },
        labelLine: {
          normal: {
            lineStyle: {
              color: '#CED1DE',
            },
            length: 5,
            length2: 10,
          },
        },
      },
    ],
  }
  chartInstance.setOption(options, true)
}

useEcharts(props, updateChart)
</script>
<style lang="scss" scoped>
@import '../index';
</style>
