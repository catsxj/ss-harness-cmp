import { onBeforeUnmount, onMounted, ref, shallowRef, watch, type Ref, type WatchSource } from 'vue'
import * as echarts from 'echarts'

export const DEFAULT_COLORS = [
  '#2563eb',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#ea580c',
  '#65a30d'
]

// 共享样式令牌 — 消除 6 个 chart 组件里重复的 hex 字面量
export const AXIS_LINE = { lineStyle: { color: '#cbd2da' } }
export const AXIS_LABEL = { color: '#475569', fontSize: 11 }
export const AXIS_NAME_TEXT = { color: '#94a3b8', fontSize: 11 }
export const SPLIT_LINE_DASHED = { lineStyle: { color: '#e4e7eb', type: 'dashed' as const } }

export interface ChartSetting {
  color?: string[]
  legend?: Record<string, any>
  xAxis?: Record<string, any>
  yAxis?: Record<string, any>
  grid?: Record<string, any>
  series?: Record<string, any>
  [key: string]: any
}

// 全局 resize 监听（所有 chart 共享一个 window listener + Set 注册表）
const resizePool = new Set<echarts.ECharts>()
let resizeAttached = false
function ensureResizeListener() {
  if (resizeAttached) return
  resizeAttached = true
  window.addEventListener('resize', () => resizePool.forEach((c) => c.resize()))
}

export interface UseChartReturn {
  rootRef: Ref<HTMLElement | null>
  chart: Ref<echarts.ECharts | null>
  render: () => void
  resize: () => void
}

/**
 * 统一的 ECharts 初始化 composable
 * - 自动 mount/watch props → setOption / onBeforeUnmount dispose
 * - 全局共享 resize 监听，避免 N 个 chart = N 个 listener
 * - 把各 chart 组件的 watch 样板集中到这里
 */
export function useChart(
  buildOption: () => echarts.EChartsOption | null,
  watchSources: WatchSource[] = []
): UseChartReturn {
  const rootRef = ref<HTMLElement | null>(null)
  const chart = shallowRef<echarts.ECharts | null>(null)

  function render() {
    if (!rootRef.value) return
    if (!chart.value) {
      chart.value = echarts.init(rootRef.value, undefined, { renderer: 'canvas' })
      resizePool.add(chart.value)
    }
    const opt = buildOption()
    if (!opt) {
      chart.value.clear()
      return
    }
    chart.value.setOption(opt, true)
  }

  function resize() {
    chart.value?.resize()
  }

  onMounted(() => {
    ensureResizeListener()
    render()
    watchSources.forEach((src) => watch(src, render, { deep: true }))
  })

  onBeforeUnmount(() => {
    if (chart.value) {
      resizePool.delete(chart.value)
      chart.value.dispose()
      chart.value = null
    }
  })

  return { rootRef, chart, render, resize }
}

export { echarts }
