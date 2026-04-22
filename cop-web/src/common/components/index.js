import Vue from 'vue'
import TimeSelect from './TimeSelect.vue'
import RichCharts from './rich-chart/index.vue'
import SkuTable from './sku-table/index.vue'
import WsUploadFile from './upload-file/index.vue'
const components = {
  TimeSelect,
  RichCharts,
  SkuTable,
  WsUploadFile
}
Object.keys(components).forEach(key => {
  Vue.component(key, components[key]);
})
