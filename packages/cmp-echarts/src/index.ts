import type { App } from 'vue'
import BarCharts from './BarCharts.vue'
import BarReverseCharts from './BarReverseCharts.vue'
import LineCharts from './LineCharts.vue'
import PieCharts from './PieCharts.vue'
import GaugeCharts from './GaugeCharts.vue'
import LiquidFillCharts from './LiquidFillCharts.vue'

export {
  BarCharts,
  BarReverseCharts,
  LineCharts,
  PieCharts,
  GaugeCharts,
  LiquidFillCharts
}
export * from './useChart'

const COMPONENTS = {
  BarCharts,
  BarReverseCharts,
  LineCharts,
  PieCharts,
  GaugeCharts,
  LiquidFillCharts,
  LoopCharts: PieCharts
} as const

function toKebab(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/^([A-Z])/, (_, c: string) => c.toLowerCase())
    .toLowerCase()
}

export function registerCmpEcharts(app: App): void {
  for (const [name, comp] of Object.entries(COMPONENTS)) {
    app.component(name, comp)
    app.component(toKebab(name), comp)
  }
}
