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

export {
  BasicForm,
  BasicFormItem,
  BasicTable,
  AdvanceTable,
  TableSearch,
  CommonDetail,
  CommonDetailItem,
  StatusIcon,
  SvgIcon,
  Empty
}

export { default as validationPresets } from './validate'

const COMPONENTS = {
  BasicForm,
  BasicFormItem,
  BasicTable,
  AdvanceTable,
  SmartTable: AdvanceTable,
  TableSearch,
  CommonDetail,
  CommonDetailRight: CommonDetail,
  CommonDetailItem,
  StatusIcon,
  SvgIcon,
  Icon: SvgIcon,
  Empty
} as const

function toKebab(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/^([A-Z])/, (_, c: string) => c.toLowerCase())
    .toLowerCase()
}

export function registerCmpElement(app: App): void {
  for (const [name, comp] of Object.entries(COMPONENTS)) {
    app.component(name, comp)
    app.component(toKebab(name), comp)
  }
  app.component('empty', Empty)
}
