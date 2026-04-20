import type { App } from 'vue'
import SkuTable from './sku-table/index.vue'
import WsUploadFile from './upload-file/index.vue'

export function registerGlobalComponents(app: App): void {
  app.component('SkuTable', SkuTable)
  app.component('WsUploadFile', WsUploadFile)
}
