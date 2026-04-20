export const columns = [
  {
    type: 'selection'
  },
  {
    label: '标题',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '服务目录',
    prop: 'catalogName'
  },
  {
    label: '服务名称',
    prop: 'serviceName'
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '创建人',
    prop: 'creatorName'
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  },
  {
    label: '操作',
    disabled: true,
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
]
export const searchConfigs: Base.ISearchConfig[] = [
  {
    type: 'Select',
    value: 'catalogId',
    label: '服务目录',
    data: []
  },
  {
    type: 'Select',
    value: 'serviceId',
    label: '服务名称',
    data: []
  },
  {
    type: 'Select',
    value: 'status',
    label: '状态',
    data: [
      { id: 'enable', name: '启用' },
      { id: 'disable', name: '禁用' }
    ]
  },
  { type: 'Input', label: '标题', value: 'name' }
]
