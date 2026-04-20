export const columns = [
  {
    type: 'selection'
  },
  {
    label: '登录账号',
    prop: 'account',
    sortable: 'custom',
    scopedSlots: { customRender: 'account' }
  },
  {
    label: '用户姓名',
    prop: 'name',
    sortable: 'custom'
  },
  {
    label: '性别',
    prop: 'sex',
    scopedSlots: { customRender: 'sex' }
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '联系方式',
    prop: 'mobile'
  },
  {
    label: '用户邮箱',
    prop: 'email',
    showOverflowTooltip: true
  },
  {
    label: '创建时间',
    prop: 'gmtCreate',
    sortable: 'custom'
  },
  {
    label: '用户工号',
    prop: 'jobNumber',
    checked: false
  },
  {
    label: '公司名称',
    prop: 'company',
    checked: false
  },
  {
    label: '用户描述',
    prop: 'remark',
    checked: false
  },
  {
    label: '操作',
    disabled: true,
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
]
export const searchConfigs: Base.ISearchConfig[] = [
  { label: '登录账号', value: 'account', type: 'Input' },
  { label: '用户名称', value: 'name', type: 'Input' },
  { label: '联系方式', value: 'mobile', type: 'Input' }
  // { label: '角色', value: 'roleId', type: 'Select', data: [] }
]
export const sexData = [
  { name: '女', value: '0', value1: 'false' },
  { name: '男', value: '1', value1: 'true' }
]
