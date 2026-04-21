import type { App } from 'vue'
import BasicForm from './BasicForm.vue'
import BasicFormItem from './BasicFormItem.vue'
import BasicTable from './BasicTable.vue'
import AdvanceTable from './AdvanceTable.vue'
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

// cmp-element / cmp-echarts 兼容层：自研包不可升级 Vue 3，应用侧重写
export function registerCompatComponents(app: App): void {
  // basic-* 系列
  app.component('basic-form', BasicForm)
  app.component('BasicForm', BasicForm)
  app.component('basic-form-item', BasicFormItem)
  app.component('BasicFormItem', BasicFormItem)
  app.component('basic-table', BasicTable)
  app.component('BasicTable', BasicTable)

  // AdvanceTable / SmartTable
  app.component('AdvanceTable', AdvanceTable)
  app.component('advance-table', AdvanceTable)
  app.component('SmartTable', AdvanceTable)
  app.component('smart-table', AdvanceTable)

  // common-detail*
  app.component('common-detail', CommonDetail)
  app.component('CommonDetail', CommonDetail)
  app.component('common-detail-item', CommonDetailItem)
  app.component('CommonDetailItem', CommonDetailItem)
  app.component('common-detail-right', CommonDetail)
  app.component('CommonDetailRight', CommonDetail)

  // 杂项
  app.component('status-icon', StatusIcon)
  app.component('StatusIcon', StatusIcon)
  app.component('svg-icon', SvgIcon)
  app.component('SvgIcon', SvgIcon)

  app.component('Icon', SvgIcon)
  app.component('empty', Empty)
  app.component('Empty', Empty)

  // cmp-echarts：基于 echarts 5 + echarts-liquidfill 的封装
  app.component('bar-charts', BarCharts)
  app.component('BarCharts', BarCharts)
  app.component('bar-reverse-charts', BarReverseCharts)
  app.component('BarReverseCharts', BarReverseCharts)
  app.component('line-charts', LineCharts)
  app.component('LineCharts', LineCharts)
  app.component('pie-charts', PieCharts)
  app.component('PieCharts', PieCharts)
  app.component('gauge-charts', GaugeCharts)
  app.component('GaugeCharts', GaugeCharts)
  app.component('liquid-fill-charts', LiquidFillCharts)
  app.component('LiquidFillCharts', LiquidFillCharts)
  // loop-charts 在 sms-web 用于循环切换 Pie 展示，这里复用 PieCharts
  app.component('loop-charts', PieCharts)
  app.component('LoopCharts', PieCharts)
}
