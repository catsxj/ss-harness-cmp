<template>
    <div :class="className" :id="id" :style="{height:height,width:width}"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useEcharts, defaultEchartsProps } from '../useEcharts'
import type { EChartsType } from 'echarts'

const props = defineProps({
  ...defaultEchartsProps,
})

const emit = defineEmits<{
  (e: 'mouseup', params: Record<string, unknown>): void
}>()

function hideOperate() {
  const targetArr = document.getElementsByClassName('operate-node-menu')
  for (const item of targetArr) {
    ;(item as HTMLElement).style.display = 'none'
  }
}

function handleDocumentClick(event: Event) {
  event.stopPropagation()
  hideOperate()
}

function handleContextMenu() {
  return false
}

function updateChart(chartInstance: EChartsType) {
  if (!props.data) return
  const setting = props.setting as Record<string, unknown>
  const d = props.data as Record<string, unknown>
  if (!d.nodes || !d.links) return
  const options = {
    animationDuration: 100,
    animationDurationUpdate: 300,
    animationEasingUpdate: 'quinticInOut',
    toolbox: setting.toolbox,
    series: [
      {
        type: 'graph',
        layout: 'force',
        draggable: true,
        symbolSize: 50,
        roam: true,
        edgeSymbol: ['circle', 'none'],
        edgeSymbolSize: [0, 10],
        focusNodeAdjacency: true,
        lineStyle: {
          normal: {
            opacity: 1,
            width: 1,
            curveness: 0,
          },
        },
        label: {
          normal: {
            position: (setting.labelPosition as string) || 'bottom',
            show: true,
            textStyle: {
              fontSize: 12,
            },
          },
        },
        force: {
          layoutAnimation: true,
          repulsion: [1000, 1200],
          edgeLength: [150, 200],
        },
        edgeLabel: {
          normal: {
            show: true,
            textStyle: {
              fontSize: 12,
            },
            formatter: '{c}',
            backgroundColor: '#fff',
            padding: 5,
            color: '#4b59fd',
            borderRadius: 3,
          },
        },
        data: d.nodes,
        links: d.links,
      },
    ],
  }
  chartInstance.setOption(options, true)
}

const { chart } = useEcharts(props, updateChart)

onMounted(() => {
  if (chart.value) {
    chart.value.on('mouseup', (params: Record<string, unknown>) => {
      if (params.dataType === 'edge') return
      const event = (params.event as Record<string, unknown>)?.event as MouseEvent
      event?.stopPropagation()
      if (event?.button === 2) {
        hideOperate()
        emit('mouseup', params)
      }
    })
  }
  document.addEventListener('click', handleDocumentClick)
  document.oncontextmenu = handleContextMenu
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>
