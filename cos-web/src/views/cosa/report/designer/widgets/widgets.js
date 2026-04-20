import Vue from 'vue'
import { formGroups, echartsGroups, mediaGroups } from '../config'

const renderComponent = arr =>
  arr.forEach(item => {
    Vue.component(`widget-${item.value}`, () => import(`@/views/cosa/report/designer/widgets/widget-${item.value}.vue`))
  })

export const renderWidgets = function () {
  renderComponent(formGroups)
  renderComponent(echartsGroups)
  renderComponent(mediaGroups)
}
