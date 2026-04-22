import { getBsmHostNetwork } from '@/services/task/resource'
export const columns = [
  { label: '主机名称', prop: 'name' },
  { label: '状态', prop: 'status', scopedSlots: { customRender: 'status' } },
  { label: 'IP', prop: 'ip' },
  { label: '所有IP', prop: 'ips', scopedSlots: { customRender: 'ips' } },
  { label: '系统类别', prop: 'osCategory' },
  { label: '所属网段', prop: 'segmentName' },
  { label: '所属平台', prop: 'vendorName' },
  { label: '平台类型', prop: 'vendorType' },
  // { label: 'Ansiable', prop: 'known', scopedSlots: { customRender: 'known' } },
  // { label: 'Salt纳管', prop: 'saltKnown', scopedSlots: { customRender: 'saltKnown' } },
  { label: '操作', disabled: true, width: '220px', scopedSlots: { customRender: 'operate' } }
]

const searchConfigs = [
  {
    label: '主机名称',
    value: 'name',
    type: 'Input'
  },
  {
    label: 'IP地址',
    value: 'ips',
    type: 'Input'
  },
  {
    label: '所属网段',
    value: 'segmentId',
    type: 'Select',
    sign: 'EQ',
    data: [],
    service: {
      api: getBsmHostNetwork,
      params: { page: 1, rows: 999999, params: '[]' },
      attr: 'data.rows'
    }
  },
  {
    label: '状态',
    value: 'status',
    type: 'Select',
    sign: 'EQ',
    data: [
      { id: 'RUNNING', name: '运行中' },
      { id: 'STOPPED', name: '已关机' },
      { id: 'SUSPENDED', name: '已挂起' },
      { id: 'PAUSED', name: '已停止' },
      { id: 'UNKNOWN', name: '已断开' },
      { id: 'EXCEPTION', name: '异常' },
      { id: 'UNKNOWSTATUS', name: '未知' }
    ]
  },
  {
    label: '所属平台',
    value: 'vendorName',
    type: 'Input'
  }
]

export const pmSearchConfigs = [{ type: 'Const', value: 'category', initValue: 'PHYSICAL' }, ...searchConfigs]
export const vmSearchConfigs = [{ type: 'Const', value: 'category', initValue: 'LOGICAL' }, ...searchConfigs]
