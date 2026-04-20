/**
 * Created by Zhang Haijun on 2018/3/6.
 */
const menuData = [
  {
    name: '主页',
    path: '/',
    component: 'Home',
    children: [
      {
        name: '审批',
        path: '/apply',
        router: 'ApplyTplPreview',
        meta: '[]',
        component: 'ApplyManage',
        category: 'menu'
      },
      // {
      //   name: '帮助',
      //   path: '/document',
      //   router: 'Document',
      //   meta: '[]',
      //   component: 'Document',
      //   category: 'menu'
      // },
      {
        name: '回收站',
        path: '/recycle',
        router: 'Recycle',
        meta: '[]',
        component: 'Recycle',
        category: 'view'
      },
      {
        name: '购物车',
        path: '/shop',
        router: 'Shop',
        meta: '[]',
        component: 'MyCar',
        category: 'view'
      },
      {
        router: 'Order',
        name: '订单',
        path: '/order',
        meta: '[]',
        component: 'App',
        category: 'menu',
        redirect: '/order/list',
        children: [
          {
            name: '订单列表',
            path: '/order/list',
            router: 'OrderManage',
            meta: '[]',
            component: 'OrderManage',
            category: 'view'
          },
          {
            name: '订单确认',
            router: 'OrderConfirm',
            path: '/order/confirm/:sn',
            meta: '[]',
            component: 'OrderConfirm',
            category: 'view'
          },
          {
            name: '订单支付',
            router: 'OrderPay',
            path: '/order/:sn',
            meta: '[]',
            component: 'OrderPay',
            category: 'view'
          }
        ]
      },
      {
        name: '费用',
        path: '/bill',
        router: 'Bill',
        meta: '[]',
        component: 'App',
        category: 'menu',
        redirect: '/bill/list',
        children: [
          {
            name: '账单列表',
            path: '/bill/list',
            router: 'BillManage',
            meta: '[]',
            component: 'BillManage',
            category: 'view'
          },
          {
            name: '账单支付',
            router: 'BillPay',
            path: '/bill/:sn',
            meta: '[]',
            component: 'BillPay',
            category: 'view'
          }
        ]
      },
      // {
      //   name: '账单分析',
      //   path: '/projectBill',
      //   router: 'ProjectBill',
      //   meta: '[]',
      //   component: 'ProjectBill',
      //   category: 'menu'
      // },
      {
        name: '工单',
        path: '/work_order',
        router: 'WorkOrder',
        meta: '[]',
        component: 'App',
        category: 'menu',
        children: [
          {
            name: '我的工单',
            path: '/work_order/list',
            router: 'WorkOrderList',
            meta: '[]',
            component: 'WorkOrder',
            category: 'menu'
          },
          {
            name: '新建工单',
            router: 'WorkOrderCreate',
            path: '/work_order/create',
            meta: '[]',
            component: 'WorkOrderCreate',
            category: 'menu'
          }
        ]
      },
      {
        name: '系统',
        path: '/system',
        meta: '[{"key": "alwaysShow", "value": true}]',
        component: 'App',
        category: 'menu',
        children: [
          {
            name: '用户管理',
            router: 'User',
            meta: '[]',
            path: '/system/user',
            component: 'UserManager',
            category: 'menu',
            role: ['Tenant']
          },
          {
            name: '项目管理',
            router: 'ProjectManage',
            path: '/system/project',
            meta: '[]',
            component: 'ProjectManage',
            category: 'menu',
            role: ['Tenant', 'Project']
          },
          {
            name: '标签管理',
            router: 'Tag',
            path: '/system/tag',
            meta: '[]',
            component: 'Tag',
            category: 'menu',
            role: ['Tenant']
          },
          {
            name: '流程管理',
            router: 'FlowManage',
            path: '/system/flow',
            meta: '[]',
            component: 'FlowManage',
            category: 'menu',
            role: ['Tenant']
          },
          {
            name: '新增流程',
            router: 'CreateFlow',
            path: '/system/flow/create',
            meta: '[]',
            component: 'CreateFlow',
            category: 'view',
            role: ['Tenant']
          },
          {
            name: '编辑流程',
            router: 'ModifyFlow',
            path: '/system/flow/modify/:id',
            meta: '[]',
            component: 'CreateFlow',
            category: 'view',
            role: ['Tenant']
          }
          // {
          //   name: '资源认领',
          //   router: 'StockResource',
          //   path: '/system/stockresource',
          //   meta: '[]',
          //   component: 'StockResource',
          //   category: 'menu'
          // }
        ]
      }
    ]
  }
]
export default menuData
