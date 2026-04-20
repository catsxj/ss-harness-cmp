const monitor = {
  RecycleAnalysis: () => import('views/cosa/config/recycle.vue'),
  AddCapacityAnalysis: () => import('views/cosa/config/capacity.vue'),
  SoaOrderDashboard: () => import('views/cosa/order/dashboard.vue'),
  SoaOrderCount: () => import('views/cosa/order/count/index.vue'),
  SoaResourceDashboard: () => import('views/cosa/resource/dashboard.vue'),
  SoaResourceStatus: () => import('views/cosa/resource/status.vue'),
  SoaResourceCapacity: () => import('views/cosa/resource/capacity.vue'),
  SoaTenantDashboard: () => import('views/cosa/tenant/dashboard.vue'),
  SoaTenantReportForms: () => import('views/cosa/tenant/reportSheet/index.vue'),
  documentCenter: () => import('views/cosa/document/index.vue'),
  documentModify: () => import('views/cosa/document/add.vue'),
  documentAdd: () => import('views/cosa/document/add.vue'),
  OrderList: () => import('views/cosa/order/list.vue'),
  orderPandect: () => import('views/cosa/order/pandect.vue'),
  OrderCount: () => import('views/cosa/order/count/index.vue'),
  BillList: () => import('views/cosa/bills/list/Index.vue'),
  BillCount: () => import('views/cosa/bills/count/Index.vue'),
  BillPandect: () => import('views/cosa/bills/pandect.vue'),
  CostOverview: () => import('views/cosa/bills/costOverview/index.vue'),
  // 成本优化报表
  CostOptimizationReport: () => import('views/cosa/cost/CostOptimizationReport/index.vue'),
  // 成本优化配置
  CostOptimizationAllocation: () => import('views/cosa/cost/CostOptimizationAllocation/index.vue'),
  // 新增资源报表
  NewResourceReport: () => import('views/cosa/cost/NewResourceReport.vue'),
  // 全局资源监测
  GlobalResourceMonitoring: () => import('views/cosa/cost/GlobalResourceMonitoring.vue'),
  // 报表管理
  // 仪表板
  Panel: () => import('views/cosa/report/panel/index.vue'),
  // 数据集
  Dataset: () => import('views/cosa/report/dataset/index.vue'),
  // 数据源
  Datasource: () => import('views/cosa/report/datasource/index.vue'),
  // 报表设计器
  Designer: () => import('views/cosa/report/designer/index.vue'),
  // 报表预览
  Preview: () => import('views/cosa/report/custom/preview.vue'),
  AccountConfig: () => import('views/cosa/bills/account/index.vue'),
  // 自定义账单
  CustomBilling: () => import('views/cosa/bills/customBilling/index.vue'),
  // 资源分析
  ResourceAnalysis: () => import('views/cosa/resource/resourceAnalysis.vue')

}
export default monitor
