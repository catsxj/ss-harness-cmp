const system = {
  UserManager: () => import('views/system/user/index.vue'),
  ProjectManage: () => import('views/system/project/index.vue'),
  FlowManage: () => import('views/system/flow/index.vue'),
  CreateFlow: () => import('views/system/flow/create_flow/graph.vue'),
  Tag: () => import('views/system/tag/index.vue'),
  ApplyManage: () => import('views/personal/apply/index.vue'),
  Document: () => import('views/document/index.vue'),
  Recycle: () => import('views/personal/recycle/index.vue'),
  BillManage: () => import('views/bill/index.vue'),
  BillPay: () => import('views/bill/BillPay.vue'),
  ProjectBill: () => import('views/bill/Project.vue'),
  OrderManage: () => import('views/order/index.vue'),
  OrderPay: () => import('views/order/OrderPay.vue'),
  OrderConfirm: () => import('views/order/OrderConfirm.vue'),
  WorkOrder: () => import('views/workorder/index.vue'),
  WorkOrderCreate: () => import('views/workorder/problemPosing.vue'),
  MyKeypair: () => import('views/resource/keypair/index.vue'),
  MyRecycle: () => import('views/personal/recycle/index.vue'),
  MyCar: () => import('views/personal/shopping/index.vue'),
  StockResource: () => import('views/system/stockResource/index.vue')
}
export default system
