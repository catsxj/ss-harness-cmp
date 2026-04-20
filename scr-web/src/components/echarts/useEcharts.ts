import * as echarts from 'echarts'
import type { EChartsType } from 'echarts'
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import theme from './theme/walden'

export interface EchartsProps {
  data: unknown
  setting: Record<string, unknown>
  unit: string
  className: string
  dataZoom: boolean
  id: string
  width: string
  height: string
  theme?: string
}

export const defaultEchartsProps = {
  data: {
    type: null as unknown as undefined,
  },
  setting: {
    type: Object,
    default: () => ({ fixed: 0 }),
  },
  unit: {
    type: String,
    default: '',
  },
  className: {
    type: String,
    default: 'chart',
  },
  dataZoom: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: () => new Date().getTime().toString() + Math.random(),
  },
  width: {
    type: String,
    default: '200px',
  },
  height: {
    type: String,
    default: '300px',
  },
  theme: {
    type: String,
  },
}

export function getLinerColor(startColor: string, endColor?: string) {
  if (!endColor) return startColor
  return new echarts.graphic.LinearGradient(0, 0, 1, 1, [
    { offset: 0, color: startColor },
    { offset: 1, color: endColor },
  ])
}

export function useEcharts(
  props: EchartsProps,
  updateChart: (chart: EChartsType, echartsLib: typeof echarts) => void
) {
  const chart = ref<EChartsType | null>(null)

  const themeColor = computed(() => ({
    legendColor: '#fff',
    axisColor: '#ccc',
  }))

  function initChart() {
    echarts.registerTheme('mytheme', theme)
    const target = document.getElementById(props.id)
    if (!target) return
    chart.value = echarts.init(target, 'mytheme', {
      devicePixelRatio: 1,
    })
    doUpdate()
  }

  function doUpdate() {
    if (chart.value) {
      updateChart(chart.value, echarts)
    }
  }

  function resize() {
    if (chart.value) chart.value.resize()
  }

  onMounted(() => {
    initChart()
    window.addEventListener('resize', resize)
  })

  onUnmounted(() => {
    if (chart.value) {
      chart.value.dispose()
      chart.value = null
    }
    window.removeEventListener('resize', resize)
  })

  watch(themeColor, (newVal, oldVal) => {
    if (oldVal && newVal.legendColor === oldVal.legendColor) return
    doUpdate()
  })

  watch(
    () => props.data,
    () => {
      doUpdate()
    }
  )

  return {
    chart,
    echarts: echarts,
    themeColor,
    resize,
    doUpdate,
  }
}
