import type { App } from 'vue'
import BasicForm from './BasicForm.vue'
import BasicFormItem from './BasicFormItem.vue'
import BasicTable from './BasicTable.vue'
import AdvanceTable from './AdvanceTable.vue'
import TableSearch from './TableSearch.vue'
import CommonDetail from './CommonDetail.vue'
import CommonDetailItem from './CommonDetailItem.vue'
import StatusIcon from './StatusIcon.vue'
import SvgIcon from './SvgIcon.vue'
import Empty from './Empty.vue'
import BarCharts from './BarCharts.vue'
import BarReverseCharts from './BarReverseCharts.vue'
import LineCharts from './LineCharts.vue'
import PieCharts from './PieCharts.vue'
import GaugeCharts from './GaugeCharts.vue'
import LiquidFillCharts from './LiquidFillCharts.vue'

// 业务模板含 kebab-case 和 PascalCase 两种写法，显式双注册避免依赖 Vue 自动推断（Qiankun 下 compilerOptions 可能与独立运行时不一致）
const COMPONENTS = {
  BasicForm,
  BasicFormItem,
  BasicTable,
  AdvanceTable,
  SmartTable: AdvanceTable,
  TableSearch,
  CommonDetail,
  CommonDetailItem,
  CommonDetailRight: CommonDetail,
  StatusIcon,
  SvgIcon,
  Icon: SvgIcon,
  Empty,
  BarCharts,
  BarReverseCharts,
  LineCharts,
  PieCharts,
  GaugeCharts,
  LiquidFillCharts,
  LoopCharts: PieCharts
} as const

function toKebab(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/^([A-Z])/, (_, c) => c.toLowerCase()).toLowerCase()
}

export function registerCompatComponents(app: App): void {
  for (const [name, comp] of Object.entries(COMPONENTS)) {
    app.component(name, comp as any)
    app.component(toKebab(name), comp as any)
  }
  // 保留 'empty' / 'Empty' 的小写形式（业务直接用了 <empty>）
  app.component('empty', Empty)
}
