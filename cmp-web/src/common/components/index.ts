import type { App } from 'vue'
import TimeSelect from './TimeSelect.vue'
import RichCharts from './rich-chart/index.vue'
import MonitorCharts from './monitor-chart/index.vue'
import SkuTable from './sku-table/index.vue'
import WsUploadFile from './upload-file/index.vue'

// 保留 cmp-web Vue 2 时代 5 个全局注册组件。业务视图内部已经按名字引用。
export function registerGlobalComponents(app: App): void {
  app.component('TimeSelect', TimeSelect)
  app.component('RichCharts', RichCharts)
  app.component('MonitorCharts', MonitorCharts)
  app.component('SkuTable', SkuTable)
  app.component('WsUploadFile', WsUploadFile)
}
