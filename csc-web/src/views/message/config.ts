export const columns = [
  {
    label: '名称',
    prop: 'name',
    disabled: true,
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  // {
  //   label: '类型',
  //   prop: 'type'
  // },
  {
    label: '内容',
    prop: 'content'
  },
  {
    label: '时间',
    prop: 'gmtCreate'
  }
]
export const searchConfigs = [
  {
    label: '名称',
    value: 'name',
    type: 'Input'
  },
  {
    label: '内容',
    value: 'content',
    type: 'Input'
  },
  {
    label: '',
    value: 'gmtCreate',
    type: 'DateRange'
  },
  {
    value: 'status',
    type: 'Const',
    initValue: ''
  }
]
