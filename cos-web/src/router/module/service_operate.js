/**
 * Created by HaijunZhang on 2018/11/12.
 */
const service = {
  ServiceCatalog: () => import('views/service_operate/product/service_catalog/index.vue'),
  ProductManage: () => import('views/service_operate/product/sku/list.vue'),
  // 国联证券 物理机规格
  PhysicalSku: () => import('views/service_operate/product/PhysicalSku/index.vue'),
  FlowList: () => import('views/service_operate/flow/list.vue'),
  CreateFlow: () => import('views/service_operate/flow/flow_create/graph.vue'),
  FlowWorkOrder: () => import('views/service_operate/flow/flowWorkOrder.vue'),
  ServiceBindFlow: () => import('views/service_operate/flow/bindFlow.vue'),
  SlaList: () => import('views/service_operate/product/sla/list.vue'),
  SlaCreate: () => import('views/service_operate/product/sla/add.vue'),
  PublicBillReport: () => import('views/service_operate/report/bill/index.vue'),
  VmStatement: () => import('views/service_operate/report/vmStatement/index.vue'),
  vmPrivate: () => import('views/service_operate/report/vmStatement/private/index.vue'),
  vmPublic: () => import('views/service_operate/report/vmStatement/public/index.vue'),
  service_provider: () => import('views/service_operate/platform/list.vue'),
  ProjectManager: () => import('views/service_operate/project/index.vue'),
  LabelManage: () => import('views/service_operate/tag.vue'),
  IFrame: () => import('@/layouts/iframe.vue'),
  Policy: () => import('views/service_operate/policy/index.vue'),
  ComputeResourceReport: () => import('views/service_operate/report/resource/compute.vue'),
  StorageReport: () => import('views/service_operate/report/resource/storage.vue'),
  IpReport: () => import('views/service_operate/report/resource/ip.vue'),
  TenantReport: () => import('views/service_operate/report/resource/tenant.vue'),
  ScreenList: () => import('views/screen/index.vue'),
  RecyclingReport: () => import('views/service_operate/report/recyclingReport/index.vue'),
  WorkAnalysis: () => import('views/service_operate/report/workAnalysis/index.vue')
}
export default service
