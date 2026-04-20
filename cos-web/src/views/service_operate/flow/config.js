export const columns = [
  {
    label: '流程名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '状态',
    prop: 'state',
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
    label: '修改时间',
    prop: 'gmtModify'
  },
  {
    label: '操作',
    disabled: true,
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
]
export const searchConfigs = [
  { label: '流程名称', value: 'name', type: 'Input' },
  { label: '创建', value: 'gmtCreate', type: 'DateRange' }
]
