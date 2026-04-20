<template>
  <div :class="className" :id="id" :style="{height:height,width:width}"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useEcharts, defaultEchartsProps } from '../useEcharts'
import axios from 'axios'
import type { EChartsType } from 'echarts'
import * as echarts from 'echarts'

const props = defineProps({
  ...defaultEchartsProps,
})

const emit = defineEmits<{
  (e: 'callback', data: unknown): void
}>()

async function updateChart(chartInstance: EChartsType) {
  const setting = props.setting as Record<string, unknown>
  const data = await axios.get('/static/suzhou.json')

  echarts.registerMap('suzhou', data.data)
  const points = [
    { value: [120.731263, 31.33346], itemStyle: { color: '#4ab2e5' } },
    { value: [120.755293, 31.263135], itemStyle: { color: '#4fb6d2' } },
    { value: [120.665507, 31.392156], itemStyle: { color: '#52b9c7' } },
    { value: [120.802975, 31.366708], itemStyle: { color: '#5abead' } },
    { value: [120.764393, 31.185771], itemStyle: { color: '#f34e2b' } },
  ]
  const options = {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    geo: {
      show: false,
      map: 'suzhou',
      aspectScale: 0.75,
      zoom: 1.1,
      roam: false,
      itemStyle: {
        normal: {
          areaColor: {
            type: 'radial',
            x: 0.5,
            y: 0.5,
            r: 0.8,
            colorStops: [
              { offset: 0, color: '#09132c' },
              { offset: 1, color: '#274d68' },
            ],
            globalCoord: true,
          },
          shadowColor: 'rgb(58,115,192)',
          shadowOffsetX: 10,
          shadowOffsetY: 11,
        },
        emphasis: {
          areaColor: '#2AB8FF',
          borderWidth: 0,
          color: 'green',
          label: {
            show: false,
          },
        },
      },
      regions: [
        {
          name: '南海诸岛',
          itemStyle: {
            areaColor: 'rgba(0, 10, 52, 1)',
            borderColor: 'rgba(0, 10, 52, 1)',
            normal: {
              opacity: 0,
              label: {
                show: false,
                color: '#009cc9',
              },
            },
          },
        },
      ],
    },
    series: [
      {
        type: 'map',
        roam: false,
        label: {
          normal: {
            show: true,
            textStyle: {
              color: '#1DE9B6',
            },
          },
          emphasis: {
            textStyle: {
              color: 'rgb(183,185,14)',
            },
          },
        },
        itemStyle: {
          normal: {
            borderColor: 'rgb(147, 235, 248)',
            borderWidth: 1,
            areaColor: {
              type: 'radial',
              x: 0.5,
              y: 0.5,
              r: 0.8,
              colorStops: [
                { offset: 0, color: '#09132c' },
                { offset: 1, color: '#274d68' },
              ],
              globalCoord: true,
            },
          },
          emphasis: {
            areaColor: 'rgb(46,229,206)',
            borderWidth: 0.1,
          },
        },
        zoom: 1.1,
        map: 'china',
      },
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        showEffectOn: 'render',
        zlevel: 1,
        rippleEffect: {
          period: 15,
          scale: 4,
          brushType: 'fill',
        },
        hoverAnimation: true,
        label: {
          normal: {
            formatter: '{b}',
            position: 'right',
            offset: [15, 0],
            color: '#fff',
            show: true,
          },
        },
        itemStyle: {
          normal: {
            color: '#1DE9B6',
            shadowBlur: 10,
            shadowColor: '#333',
          },
        },
        symbolSize: 12,
        data: points,
      },
      {
        type: 'lines',
        zlevel: 2,
        effect: {
          show: true,
          period: 4,
          trailLength: 0.4,
          symbol: 'arrow',
          symbolSize: 7,
        },
        lineStyle: {
          normal: {
            color: '#1DE9B6',
            width: 1,
            opacity: 0.1,
            curveness: 0.3,
          },
        },
        data: [
          {
            coords: [
              [120.731263, 31.33346],
              [120.665507, 31.392156],
            ],
            lineStyle: { color: '#4ab2e5' },
          },
          {
            coords: [
              [120.731263, 31.33346],
              [120.802975, 31.366708],
            ],
            lineStyle: { color: '#4fb6d2' },
          },
          {
            coords: [
              [120.731263, 31.33346],
              [120.764393, 31.185771],
            ],
            lineStyle: { color: '#4fb6d2' },
          },
        ],
      },
    ],
  }
  chartInstance.setOption(options, true)
}

const { chart } = useEcharts(props, updateChart)

onMounted(() => {
  if (chart.value) {
    chart.value.on('click', (params: Record<string, unknown>) => {
      if (params.componentSubType === 'effectScatter') {
        emit('callback', params.data)
      }
    })
  }
})
</script>
