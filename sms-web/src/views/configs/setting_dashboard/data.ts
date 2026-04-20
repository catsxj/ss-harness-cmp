export const shortcuts = [
  {
    name: '资源接入',
    path: '/cmp-web/vendors'
  },
  {
    name: '云平台',
    path: '/cmp-web/compute/cloud/list'
  },
  {
    name: '云主机',
    path: '/cmp-web/compute/vms'
  },
  {
    name: 'IP地址池',
    path: '/cmp-web/base_resource/ips'
  },
  {
    name: '镜像资源',
    path: '/cmp-web/base_resource/repository'
  },
  {
    name: '数据库',
    path: '/cmp-web/db/rds/mysql'
  },
  {
    name: '中间件',
    path: '/cmp-web/middleware/mq/kafka'
  },
  {
    name: '执行历史',
    path: '/cop-web/task/history/list'
  },
  {
    name: '常规作业',
    path: '/cop-web/task/task/list'
  },
  {
    name: '定时作业',
    path: '/cop-web/task/shedule/list'
  },
  {
    name: '服务目录',
    path: '/cos/products/catalogs'
  },
  {
    name: '流程管理',
    path: '/cos/flow/define/list'
  },
  {
    name: '流程工单',
    path: '/cos/flow/workorder'
  },
  {
    name: '监控概览',
    path: '/cms-web/dashboard'
  },
  {
    name: '用户管理',
    path: '/sms-web/auth/managers'
  },
  {
    name: '租户管理',
    path: '/sms-web/auth/tenants'
  },
  {
    name: '角色管理',
    path: '/sms-web/auth/roles'
  },
  {
    name: '系统配置',
    path: '/sms-web/config/system_security'
  }
  // {
  //   name: '文档中心',
  //   path: '/cos/opc/document/list'
  // }
  // {
  //   name: '资源接入',
  //   path: ''
  // },
  // {
  //   name: '资源接入',
  //   path: ''
  // },
  // {
  //   name: '资源接入',
  //   path: ''
  // }
]
export const topSetting = {
  series: {
    label: {
      show: true,
      position: 'right'
    }
  },
  yAxis: {
    axisLabel: {
      show: true,
      color: '#707274',
      rotate: 30,
      formatter(value: string) {
        return `${value?.substr(0, 5)}${value.length > 5 ? '...' : ''}`
      }
    }
  }
}
