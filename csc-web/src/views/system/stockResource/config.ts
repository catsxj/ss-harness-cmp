import { conditionServiceNew } from 'services/platform/index'
export const columns = [
  {
    type: 'selection'
  },
  {
    label: '虚拟机名称',
    prop: 'name'
  },
  {
    label: 'IP',
    prop: 'privateIps',
    sortable: 'custom',
    scopedSlots: { customRender: 'ip' }
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '规格',
    prop: 'spec',
    scopedSlots: { customRender: 'spec' }
  },
  {
    label: '操作系统',
    prop: 'os',
    scopedSlots: { customRender: 'os' }
  },
  {
    label: '平台类型',
    prop: 'vendorType'
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  },
  {
    label: '操作',
    width: '80px',
    scopedSlots: { customRender: 'operate' }
  }
]
export const searchConfigs: Base.ISearchConfig[] = [
  { label: '虚拟机名称', value: 'name', type: 'Input' },
  { label: 'IP', value: 'privateIps', type: 'Input' },
  {
    label: '状态',
    value: 'status',
    type: 'Select',
    data: [
      { id: 'RUNNING', name: '运行中' },
      { id: 'BUILDING', name: '创建中' },
      { id: 'STOPPED', name: '关机' },
      { id: 'SUSPENDED', name: '挂起' },
      { id: 'EXCEPTION', name: '异常' },
      { id: 'UNKNOWN', name: '断开' }
    ]
  },
  {
    type: 'Select',
    label: '平台类型',
    value: 'vendorType',
    data: []
  },
  { value: 'isAssign', type: 'Const', initValue: 0 },
  { value: 'isTemplate', type: 'Const', initValue: 0 }
]
