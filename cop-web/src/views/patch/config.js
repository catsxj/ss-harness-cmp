import { getUserList, getTempList } from './utils/index'
// 补丁部署列表
export const deployColumns = [
  // {
  //   type: 'selection',
  //   disabled: true
  // },
  { label: '任务名称', prop: 'name', scopedSlots: { customRender: 'name' } },
  { label: '状态', prop: 'status', scopedSlots: { customRender: 'status' } },
  // { label: '类型', prop: 'type', scopedSlots: { customRender: 'type' } },
  { label: '编排模板', prop: 'templateName' },
  { label: '创建人', prop: 'creator' },
  { label: '创建时间', prop: 'gmtCreate' },
  { label: '操作', disabled: true, width: '220px', scopedSlots: { customRender: 'operate' } }
]

export const historyColumns = [
  { label: '任务名称', prop: 'name', scopedSlots: { customRender: 'name' } },
  // { label: '任务类型', prop: 'type', scopedSlots: { customRender: 'type' } },
  { label: '补丁数', prop: 'patchNum' },
  { label: '服务器数', prop: 'serveNum' },
  { label: '失败数/成功数/总数', prop: 'failSuccessTotal' },
  { label: '编排模板', prop: 'executeTemplate' },
  { label: '执行人', prop: 'creator' },
  { label: '完成时间', prop: 'gmtCreate' }
]

// 补丁安装详情查询
export const historyDetailColumns = [
  { label: '名称', prop: 'name' },
  { label: '主机IP', prop: 'hostIp' },
  { label: '补丁名称', prop: 'patchName' },
  { label: '状态', prop: 'status', scopedSlots: { customRender: 'status' } },
  { label: '更新时间', prop: 'gmtModify' },
  { label: '报错信息', prop: 'errorInfo', scopedSlots: { customRender: 'errorInfo' } }
]

const typeList = [
  {
    id: 'WIN',
    name: 'windows'
  },
  {
    id: 'LINUX',
    name: 'linux'
  },
  {
    id: 'DBO',
    name: '单机'
  },
  {
    id: 'DBM',
    name: '集群'
  },
  {
    id: 'TOMCAT',
    name: 'tomcat'
  },
  {
    id: 'WEBLOGIC',
    name: 'weblogic'
  }
]

const statusList = [
  {
    id: 'DEVELOPING',
    name: '开发中'
  },
  {
    id: 'APPROVED',
    name: '已发布'
  }
]

// 巡检指标查询
export const deploySearchConfigs = [
  {
    label: '任务名称',
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
    label: '状态',
    value: 'status',
    type: 'Select',
    sign: 'EQ',
    data: statusList
  },
  // {
  //   label: '类型',
  //   value: 'type',
  //   type: 'Select',
  //   sign: 'EQ',
  //   data: typeList
  // },
  {
    label: '编排模板',
    value: 'execute_template',
    type: 'Select',
    sign: 'EQ',
    data: [],
    service: {
      api: getTempList,
      params: { simple: true },
      attr: 'data'
    }
  },
  {
    label: '创建',
    value: 'gmt_create',
    type: 'DateRange'
  },
  {
    label: '定时',
    value: 'timing',
    type: 'DateRange'
  }
]
// 历史记录查询
export const historySearchConfigs = [
  {
    label: '任务名称',
    value: 'name',
    type: 'Input',
    sign: 'LK'
  },
  {
    label: '类型',
    value: 'type',
    type: 'Select',
    sign: 'EQ',
    data: typeList
  },
  {
    label: '编排模板',
    value: 'execute_template',
    type: 'Select',
    sign: 'EQ',
    data: [],
    service: {
      api: getTempList,
      params: { simple: true },
      attr: 'data'
    }
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
    label: '完成',
    value: 'gmt_create',
    type: 'DateRange'
  }
]
