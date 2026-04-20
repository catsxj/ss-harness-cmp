<template>
  <dv-flyline-chart-enhanced :config="configs" :dev="true" class="chart" />
</template>

<script setup lang="ts">
import { reactive, toRefs } from 'vue'
import test, { points as aa } from './data'

interface PointItem {
  name: string
  coordinate: number[]
  icon?: { src: string; width?: number; height?: number }
  text?: { show: boolean }
}

const handleMapData = (data: Record<string, unknown> = {}) => {
  const { points = [], lines = [] } = data as { points: PointItem[]; lines: unknown[] }
  const pointArr: PointItem[] = []
  pointArr.push({
    name: 'sip',
    coordinate: [0.49, 0.26],
    icon: {
      src: '/static/img/outside/three/sip.png',
      width: 700,
      height: 700
    },
    text: {
      show: false
    }
  })
  aa.forEach((item: PointItem, index: number) => {
    const icon = index % 5
    pointArr.push({
      ...item,
      icon: {
        src: `/static/img/outside/three/${icon}.png`
      }
    })
  })
  return {
    points: pointArr,
    lines: aa.map((item: PointItem) => {
      return {
        source: 'sip',
        target: item.name,
        width: 5
      }
    }),
    icon: {
      show: true,
      src: '/static/img/outside/three/1.png',
      width: 201,
      height: 99
    },
    text: {
      show: true,
      color: '#fff',
      fontSize: 20
    },
    k: -0.8,
    line: {
      width: 3,
      color: '#7bf4ff'
    },
    halo: {
      show: true,
      radius: 120,
      color: '#7BF4FF'
    },
    bgImgSrc: '/static/img/outside/map.png'
  }
}

const configs = reactive(handleMapData())
</script>
<style lang="scss" scoped>
.chart {
  width: 100%;
  height: 100%;
  background: url('/static/img/outside/map.png') no-repeat;
  background-size: 100%;
}
</style>
