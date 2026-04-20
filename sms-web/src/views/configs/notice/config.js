export const columns = [
  {
    label: '标题',
    prop: 'title',
    scopedSlots: { customRender: 'title' }
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '发布范围',
    prop: 'sendGroups',
    scopedSlots: { customRender: 'sendGroups' }
  },
  {
    label: '发布方式',
    prop: 'sendWays',
    scopedSlots: { customRender: 'sendWays' }
  },
  {
    label: '发布人',
    prop: 'creatorName'
  },
  {
    label: '发布时间',
    prop: 'sendTime'
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

export const searchConfigs = [
  { label: '标题', value: 'title', type: 'Input', width: '220px' },
  {
    label: '状态',
    value: 'status',
    type: 'Select',
    data: [
      { name: '待发布', id: 'NOTSEND' },
      { name: '已发布', id: 'SEND' }
    ]
  },
  { type: 'DateRange', label: '', value: 'gmtCreate' }
]
