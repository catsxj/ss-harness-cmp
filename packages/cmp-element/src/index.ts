import type { App } from 'vue'
// 重新实现（无源码，sms-web Phase D 新写）
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
// A 档升级（基于 original/cmp-element/components/* 的 Vue 2 源码）
import CodeMirror from './CodeMirror.vue'
import FullScreen from './FullScreen.vue'
import JsonView from './JsonView.vue'

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
  Empty,
  CodeMirror,
  FullScreen,
  JsonView
}

export { default as validationPresets } from './validate'

// 全局注册表：只放业务默认需要的轻量组件
// CodeMirror / FullScreen / JsonView 按需 explicit import，避免 sms-web 无谓 bundle codemirror (~200KB)
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
}
