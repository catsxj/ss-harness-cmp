export const columns = [
  {
    type: 'selection'
  },
  {
    label: '登录账号',
    prop: 'account',
    scopedSlots: { customRender: 'account' }
  },
  {
    label: '名称',
    prop: 'name'
  },
  {
    label: '所属组织',
    prop: 'departmentName'
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '开启流程自管',
    prop: 'openFlow',
    scopedSlots: { customRender: 'openFlow' }
  },
  {
    label: '开启软件安装',
    prop: 'isInstallSoftware',
    scopedSlots: { customRender: 'isInstallSoftware' }
  },
  {
    label: '付费模式',
    prop: 'paymentMode',
    scopedSlots: { customRender: 'paymentMode' }
  },
  {
    label: '折扣率',
    prop: 'discount'
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
  { label: '登录账号', value: 'account', type: 'Input', width: '220px' },
  { label: '名称', value: 'name', type: 'Input' },
  {
    label: '状态',
    value: 'status',
    type: 'Select',
    data: [
      { name: '正常', id: 'NORMAL' },
      { name: '冻结', id: 'ABNORMAL' },
      { name: '注销', id: 'LOGOUT' }
    ]
  },
  { type: 'DateRange', label: '', value: 'gmtCreate' }
]
