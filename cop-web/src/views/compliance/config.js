import { getUserList } from './utils/index'
// 常规检查列表
export const normalColumns = [
  { label: '合规名称', prop: 'name', scopedSlots: { customRender: 'name' } },
  { label: '状态', prop: 'status', scopedSlots: { customRender: 'status' } },
  { label: '合规分类', prop: 'category' },
  { label: '创建人', prop: 'creatorName' },
  { label: '最后修改人', prop: 'modifierName' },
  { label: '创建时间', prop: 'gmtCreate' },
  { label: '修改时间', prop: 'gmtModify' },
  { label: '操作', disabled: true, width: '200px', scopedSlots: { customRender: 'operate' } }
]
// 定时检查列表
export const timeColumns = [
  // {
  //   type: 'selection',
  //   disabled: true
  // },
  { label: '合规名称', prop: 'name', scopedSlots: { customRender: 'name' } },
  { label: '状态', prop: 'running', scopedSlots: { customRender: 'running' } },
  { label: '执行计划', prop: 'cron' },
  { label: '合规分类', prop: 'category' },
  { label: '创建人', prop: 'creatorName' },
  { label: '最后修改人', prop: 'modifierName' },
  { label: '创建时间', prop: 'gmtCreate' },
  { label: '修改时间', prop: 'gmtModify' },
  { label: '操作', disabled: true, width: '200px', scopedSlots: { customRender: 'operate' } }
]

// 历史记录列表
export const historyColumns = [
  { label: '合规名称', prop: 'name', scopedSlots: { customRender: 'name' } },
  { label: '合规分类', prop: 'category' },
  { label: '任务类别', prop: 'type', scopedSlots: { customRender: 'type' } },
  { label: '执行人', prop: 'userName' },
  { label: '执行状态', prop: 'status', scopedSlots: { customRender: 'status' } },
  { label: '基线检查项', prop: 'itemNum' },
  { label: '检查服务器数量', prop: 'hostNum' },
  { label: '不合规基线项数', prop: 'noPassItemNum' },
  { label: '不合规服务器数', prop: 'noPassHostNum' },
  { label: '合规通过率', prop: 'passRates', scopedSlots: { customRender: 'passRates' } },
  { label: '检查时间', prop: 'gmtCreate' }
]

// 合规基线列表
export const baselineColumns = [
  { label: '基线名称', prop: 'name', scopedSlots: { customRender: 'name' } },
  { label: '基线分类', prop: 'itemType', scopedSlots: { customRender: 'itemType' } },
  { label: '脚本名称', prop: 'scriptName' },
  { label: '创建人', prop: 'creatorName' },
  { label: '最后修改人', prop: 'modifierName' },
  { label: '创建时间', prop: 'gmtCreate' },
  { label: '修改时间', prop: 'gmtModify' },
  { label: '操作', disabled: true, width: '150px', scopedSlots: { customRender: 'operate' } }
]

// 合规模板列表
export const templateColumns = [
  { label: '模板名称', prop: 'name', scopedSlots: { customRender: 'name' } },
  { label: '创建人', prop: 'creatorName' },
  { label: '最后修改人', prop: 'modifierName' },
  { label: '创建时间', prop: 'gmtCreate' },
  { label: '修改时间', prop: 'gmtModify' },
  { label: '操作', disabled: true, width: '150px', scopedSlots: { customRender: 'operate' } }
]

const inspectTypeList = [
  {
    id: 'HOST',
    name: '主机合规'
  },
  {
    id: 'DB',
    name: '数据库合规'
  },
  {
    id: 'MIDDLEWARE',
    name: '中间件合规'
  },
  {
    id: 'NETWORK',
    name: '网络合规'
  },
  {
    id: 'OTHERS',
    name: '其他合规'
  }
]

// 任务类别
const taskType = [
  {
    id: 0,
    name: '常规任务'
  },
  {
    id: 1,
    name: '定时任务'
  }
]

const statusList = [
  {
    id: 'STARTING',
    name: '启动中'
  },
  {
    id: 'RUNNING',
    name: '执行中'
  },
  {
    id: 'SUCCESS',
    name: '成功'
  },
  {
    id: 'ERROR',
    name: '错误'
  }
]

const normList = [
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

// 常规检查查询
export const normalSearchConfigs = [
  {
    label: '合规分类',
    value: 'category',
    type: 'Select',
    sign: 'EQ',
    data: inspectTypeList
  },
  {
    label: '合规名称',
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

// 定时检查查询
export const timeSearchConfigs = [
  ...normalSearchConfigs,
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
// 历史记录查询
export const historySearchConfigs = [
  {
    label: '合规名称',
    value: 'name',
    type: 'Input',
    sign: 'LK'
  },
  {
    label: '合规分类',
    value: 'category',
    type: 'Select',
    sign: 'EQ',
    data: inspectTypeList
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
    data: statusList
  },
  {
    label: '检查',
    value: 'gmtCreate',
    type: 'DateRange'
  },
  {
    label: '任务类别',
    value: 'type',
    type: 'Select',
    sign: 'EQ',
    data: taskType
  }
]
// 合规基线查询
export const baselineSearchConfigs = [
  {
    label: '基线名称',
    value: 'name',
    type: 'Input',
    sign: 'LK'
  },
  {
    label: '基线分类',
    value: 'itemType',
    type: 'Select',
    sign: 'EQ',
    data: normList
  },
  {
    label: '脚本名称',
    value: 'scriptName',
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
    label: '创建',
    value: 'gmtCreate',
    type: 'DateRange'
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
    label: '修改',
    value: 'gmtModify',
    type: 'DateRange'
  }
]

// 合规模板查询
// 合规基线查询
export const templateSearchConfigs = [
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
    label: '创建',
    value: 'gmtCreate',
    type: 'DateRange'
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
    label: '修改',
    value: 'gmtModify',
    type: 'DateRange'
  }
]
