import type { App } from 'vue'
import BarReverseCharts from './echarts/BarReverseCharts.vue'
import BarCharts from './echarts/BarCharts.vue'
import PieCharts from './echarts/PieCharts.vue'
import LineCharts from './echarts/LineCharts.vue'
import FullScreenContainer from './FullScreenContainer/index.vue'
import ScrollTable from './ScrollTable/index.vue'
import ScrollTableColumn from './ScrollTable/TableColumn.vue'
import NoData from './NoData/index.vue'

export function registerComponents(app: App) {
  app.component('BarReverseCharts', BarReverseCharts)
  app.component('BarCharts', BarCharts)
  app.component('PieCharts', PieCharts)
  app.component('LineCharts', LineCharts)
  app.component('FullScreenContainer', FullScreenContainer)
  app.component('ScrollTable', ScrollTable)
  app.component('ScrollTableColumn', ScrollTableColumn)
  app.component('NoData', NoData)
  app.component('Empty', NoData)
}
