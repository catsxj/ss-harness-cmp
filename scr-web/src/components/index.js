/**
 * Created by HaijunZhang on 2019/8/1.
 */

import BarReverseCharts from './echarts/BarReverseCharts.vue'
import BarCharts from './echarts/BarCharts.vue'
import PieCharts from './echarts/PieCharts.vue'
import LineCharts from './echarts/LineCharts.vue'
import FullScreenContainer from './FullScreenContainer'
import ScrollTable from './ScrollTable'
import ScrollTableColumn from './ScrollTable/TableColumn'
import NoData from './NoData'

const components = {
  BarReverseCharts,
  BarCharts,
  PieCharts,
  LineCharts,
  FullScreenContainer,
  ScrollTable,
  ScrollTableColumn,
  NoData,
  Empty: NoData
}
const install = function (Vue, opts = {}) {
  if (install.installed) return;
  Object.keys(components).forEach(key => {
    Vue.component(key, components[key]);
  });
}
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default {
  ...components,
  install
}
