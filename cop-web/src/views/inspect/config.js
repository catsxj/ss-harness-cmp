import { getUserList } from './utils/index'
// 常规巡检列表
export const inspectColumns = [
  // {
  //   type: 'selection',
  //   disabled: true
  // },
  { label: '巡检名称', prop: 'name', scopedSlots: { customRender: 'name' } },
  { label: '状态', prop: 'status', scopedSlots: { customRender: 'status' } },
  { label: '巡检分类', prop: 'category' },
  { label: '创建人', prop: 'creatorName' },
  { label: '最后修改人', prop: 'modifierName' },
  { label: '创建时间', prop: 'gmtCreate' },
  { label: '修改时间', prop: 'gmtModify' },
  { label: '操作', disabled: true, width: '250px', scopedSlots: { customRender: 'operate' } }
]
// 定时巡检列表
export const timingInspectColumns = [
  // {
  //   type: 'selection',
  //   disabled: true
  // },
  { label: '巡检名称', prop: 'name', scopedSlots: { customRender: 'name' } },
  { label: '状态', prop: 'running', scopedSlots: { customRender: 'running' } },
  { label: '执行计划', prop: 'cron' },
  { label: '巡检分类', prop: 'category' },
  { label: '创建人', prop: 'creatorName' },
  { label: '最后修改人', prop: 'modifierName' },
  { label: '创建时间', prop: 'gmtCreate' },
  { label: '修改时间', prop: 'gmtModify' },
  { label: '操作', disabled: true, width: '250px', scopedSlots: { customRender: 'operate' } }
]
// 巡检记录列表
export const historyColumns = [

  { label: '巡检名称', prop: 'name', scopedSlots: { customRender: 'name' } },
  { label: '巡检分类', prop: 'category' },
  { label: '巡检类型', prop: 'type', scopedSlots: { customRender: 'type' } },
  { label: '执行人', prop: 'userName' },
  { label: '执行状态', prop: 'status', scopedSlots: { customRender: 'status' } },
  { label: '巡检结果', prop: 'warning', scopedSlots: { customRender: 'warning' } },
  { label: '巡检时间', prop: 'gmtCreate' }
]
// 巡检报表列表
export const inspectReportColumns = [
  // {
  //   type: 'selection',
  //   disabled: true
  // },
  { label: '报表名称', prop: 'name', scopedSlots: { customRender: 'name' } },
  { label: '巡检分类', prop: 'inspectType', scopedSlots: { customRender: 'inspectType' } },
  { label: '巡检名称', prop: 'inspectName' },
  { label: '报表周期', prop: 'period', scopedSlots: { customRender: 'period' } },
  { label: '报表状态', prop: 'status', scopedSlots: { customRender: 'status' } },
  { label: '创建人', prop: 'creator' },
  { label: '最后修改人', prop: 'mender' },
  { label: '创建时间', prop: 'gmtCreate' },
  { label: '修改时间', prop: 'gmtModify' },
  { label: '操作', disabled: true, width: '250px', scopedSlots: { customRender: 'operate' } }]
// 告警设置列表
export const inspectAlarmColumns = [
  { label: '告警级别', prop: 'warnLevel' },
  { label: '告警描述', prop: 'remark' },
  { label: '告警颜色', prop: 'color', scopedSlots: { customRender: 'color' } },
  { label: '创建时间', prop: 'gmtCreate' },
  { label: '操作', disabled: true, width: '200px', scopedSlots: { customRender: 'operate' } }
]
// 巡检模板列表
export const inspectTempColumns = [
  { label: '模板名称', prop: 'name', scopedSlots: { customRender: 'name' } },
  { label: '创建人', prop: 'creatorName' },
  { label: '最后修改人', prop: 'modifierName' },
  { label: '创建时间', prop: 'gmtCreate' },
  { label: '修改时间', prop: 'gmtModify' },
  { label: '操作', disabled: true, width: '150px', scopedSlots: { customRender: 'operate' } }
]
// 巡检指标列表
export const inspectNormColumns = [
  { label: '指标名称', prop: 'name', scopedSlots: { customRender: 'name' } },
  { label: '指标分类', prop: 'targetType', scopedSlots: { customRender: 'targetType' } },
  { label: '创建人', prop: 'creatorName' },
  { label: '最后修改人', prop: 'modifierName' },
  { label: '创建时间', prop: 'gmtCreate' },
  { label: '修改时间', prop: 'gmtModify' },
  { label: '操作', disabled: true, width: '150px', scopedSlots: { customRender: 'operate' } }
]

const inspectTypeList = [
  {
    id: 'APPLICATION',
    name: '应用巡检'
  },
  {
    id: 'HOST',
    name: '主机巡检'
  },
  {
    id: 'DB',
    name: '数据库巡检'
  },
  {
    id: 'MIDDLEWARE',
    name: '中间件巡检'
  },
  {
    id: 'NETWORK',
    name: '网络巡检'
  },
  {
    id: 'OTHERS',
    name: '其他巡检'
  }
]

const searchConfigs = [
  {
    label: '巡检分类',
    value: 'category',
    type: 'Select',
    sign: 'EQ',
    data: inspectTypeList
  },
  {
    label: '巡检名称',
    value: 'name',
    type: 'Input',
    sign: 'LK'
  },
  {
    label: '创建人',
    value: 'creatorId',
    type: 'Select',
    sign: 'EQ',
    data: [],
    service: {
      api: getUserList,
      params: { simple: true },
      attr: 'data.rows'
    }
  },
  {
    label: '最后修改人',
    value: 'menderId',
    type: 'Select',
    sign: 'EQ',
    data: [],
    service: {
      api: getUserList,
      params: { simple: true },
      attr: 'data.rows'
    }
  },
  {
    label: '巡检',
    value: 'gmtCreate',
    type: 'DateRange'
  }
]
// 常规巡检查询
export const routineInspectSearchConfigs = [...searchConfigs]
// 定时巡检查询
export const timingInspectSearchConfigs = [
  ...searchConfigs,
  {
    label: '状态',
    value: 'running',
    type: 'Select',
    sign: 'EQ',
    data: [
      { id: '0', name: '停止' },
      { id: '1', name: '执行中' }
    ]
  }
]
// 巡检记录查询
export const historySearchConfigs = [
  {
    label: '巡检名称',
    value: 'name',
    type: 'Input',
    sign: 'LK'
  },
  {
    label: '巡检分类',
    value: 'category',
    type: 'Select',
    sign: 'EQ',
    data: inspectTypeList
  },
  {
    label: '巡检类型',
    value: 'type',
    type: 'Select',
    sign: 'EQ',
    data: [
      // 快速  常规巡检  定时巡检  人工录入
      // FAST(0),ROUTINE(1),TIMING(2),MANUAL(3)
      { id: '0', name: '快速巡检-脚本' },
      { id: '1', name: '常规巡检' },
      { id: '2', name: '定时巡检' }
      /* { id: '3', name: '人工巡检' } */
    ]
  },
  {
    label: '执行人',
    value: 'creatorId',
    type: 'Select',
    sign: 'EQ',
    data: [],
    service: {
      api: getUserList,
      params: { simple: true },
      attr: 'data.rows'
    }
  },
  {
    label: '执行状态',
    value: 'status',
    type: 'Select',
    sign: 'EQ',
    data: [
      { id: 'STARTING', name: '启动中' },
      { id: 'RUNNING', name: '执行中' },
      { id: 'SUCCESS', name: '成功' },
      { id: 'ERROR', name: '错误' }
    ]
  },
  {
    label: '巡检结果',
    value: 'warning',
    type: 'Select',
    sign: 'EQ',
    data: [
      { id: false, code: 'false', name: '正常' },
      { id: true, code: 'true', name: '告警' }
    ]
  },
  {
    label: '巡检时间',
    value: 'gmtCreate',
    type: 'DateRange'
  }
]
// 巡检报表查询
export const inspectReportSearchConfigs = [
  {
    label: '报表名称',
    value: 'name',
    type: 'Input',
    sign: 'LK'
  },
  {
    label: '巡检分类',
    value: 'inspectType',
    type: 'Select',
    sign: 'EQ',
    data: inspectTypeList
  },
  {
    label: '巡检名称',
    value: 'inspectName',
    type: 'Input',
    sign: 'LK'
  },
  {
    label: '报表周期',
    value: 'period',
    type: 'Select',
    sign: 'EQ',
    data: [
      {
        id: 'Day',
        name: '日报'
      },
      {
        id: 'Week',
        name: '周报'
      },
      {
        id: 'Month',
        name: '月报'
      }
    ]
  },
  {
    label: '报表状态',
    value: 'status',
    type: 'Select',
    sign: 'EQ',
    data: [
      {
        id: 'Off',
        name: '禁用'
      },
      {
        id: 'On',
        name: '启用'
      }
    ]
  },
  {
    label: '创建人',
    value: 'creatorId',
    type: 'Select',
    sign: 'EQ',
    data: [],
    service: {
      api: getUserList,
      params: { simple: true },
      attr: 'data.rows'
    }
  },
  {
    label: '最后修改人',
    value: 'menderId',
    type: 'Select',
    sign: 'EQ',
    data: [],
    service: {
      api: getUserList,
      params: { simple: true },
      attr: 'data.rows'
    }
  },
  {
    label: '创建',
    value: 'gmtCreate',
    type: 'DateRange'
  },
  {
    label: '修改',
    value: 'gmtModify',
    type: 'DateRange'
  }
]
// 巡检模板查询
export const inspectTempSearchConfigs = [
  {
    label: '模板名称',
    value: 'name',
    type: 'Input',
    sign: 'LK'
  },
  {
    label: '创建人',
    value: 'creatorId',
    type: 'Select',
    sign: 'EQ',
    data: [],
    service: {
      api: getUserList,
      params: { simple: true },
      attr: 'data.rows'
    }
  },
  {
    label: '最后修改人',
    value: 'menderId',
    type: 'Select',
    sign: 'EQ',
    data: [],
    service: {
      api: getUserList,
      params: { simple: true },
      attr: 'data.rows'
    }
  },
  {
    label: '创建',
    value: 'gmtCreate',
    type: 'DateRange'
  },
  {
    label: '修改',
    value: 'gmtModify',
    type: 'DateRange'
  }
]
// 巡检指标查询
export const inspectNormSearchConfigs = [
  {
    label: '指标名称',
    value: 'name',
    type: 'Input',
    sign: 'LK'
  },
  {
    label: '指标分类',
    value: 'targetType',
    type: 'Select',
    sign: 'EQ',
    data: [
      {
        id: 'host',
        name: '主机'
      },
      {
        id: 'db',
        name: '数据库'
      },
      {
        id: 'middle',
        name: '中间件'
      },
      {
        id: 'net',
        name: '网络'
      },
      {
        id: 'other',
        name: '其他'
      }
    ]
  },
  {
    label: '创建人',
    value: 'creatorId',
    type: 'Select',
    sign: 'EQ',
    data: [],
    service: {
      api: getUserList,
      params: { simple: true },
      attr: 'data.rows'
    }
  },
  {
    label: '最后修改人',
    value: 'menderId',
    type: 'Select',
    sign: 'EQ',
    data: [],
    service: {
      api: getUserList,
      params: { simple: true },
      attr: 'data.rows'
    }
  },
  {
    label: '创建',
    value: 'gmtCreate',
    type: 'DateRange'
  },
  {
    label: '修改',
    value: 'gmtModify',
    type: 'DateRange'
  }
]
