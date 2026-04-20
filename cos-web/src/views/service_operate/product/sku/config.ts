import { generateSpec } from './utils'
export const columns = [
  {
    type: 'selection',
    disabled: true
  },
  {
    label: '规格代码',
    prop: 'code',
    scopedSlots: { customRender: 'code' }
  },
  {
    label: '资费代码',
    prop: 'tariffCode'
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '规格',
    prop: 'specName',
    customRender(val: string, record: any) {
      return generateSpec(record)
    }
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  },
  {
    label: '操作',
    disabled: true,
    prop: 'id',
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
]
export const searchConfigs: Base.ISearchConfig[] = [
  {
    type: 'Select',
    value: 'status',
    label: '规格状态',
    data: [
      { id: 'enable', name: '启用' },
      { id: 'disable', name: '禁用' }
    ]
  },
  {
    type: 'Const',
    initValue: '',
    value: 'categoryId'
  }
]
