import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import * as echarts from 'echarts'

// 默认配色板：蓝系为主 + 状态色辅助
const DEFAULT_COLORS = [
  '#2563eb',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#ea580c',
  '#65a30d'
]

/**
 * Technical Precision 共享的 ECharts 初始化 composable
 * 统一主题：字体 / 网格线 / tooltip / 空值防护
 */
export function useChart(
  containerRef: Ref<HTMLElement | null>,
  buildOption: () => echarts.EChartsOption | null
) {
  let chart: echarts.ECharts | null = null

  function render() {
    if (!containerRef.value) return
    if (!chart) {
      chart = echarts.init(containerRef.value, undefined, { renderer: 'canvas' })
    }
    const opt = buildOption()
    if (!opt) {
      chart.clear()
      return
    }
    chart.setOption(opt, true)
  }

  function resize() {
    chart?.resize()
  }

  onMounted(() => {
    render()
    window.addEventListener('resize', resize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resize)
    chart?.dispose()
    chart = null
  })

  return { chart: ref(chart), render, resize }
}

export { DEFAULT_COLORS, echarts }
