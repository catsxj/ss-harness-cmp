import Vue from 'vue'
import SkuTable from './sku-table/index.vue'
import WsUploadFile from './upload-file/index.vue'
const components = {
  SkuTable,
  WsUploadFile
}
Object.keys(components).forEach((key) => {
  Vue.component(key, components[key])
})
