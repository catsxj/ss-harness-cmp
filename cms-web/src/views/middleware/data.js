export const columns = [
  {
    type: 'selection',
    disabled: true
  },
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '版本',
    prop: 'version'
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '服务地址',
    prop: 'address'
  },
  {
    label: '配置',
    prop: 'spec',
    scopedSlots: { customRender: 'spec' }
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  },
  {
    label: '过期时间',
    prop: 'expiredTime',
    scopedSlots: { customRender: 'expiredTime' }
  },
  {
    label: '所属租户',
    prop: 'tenantName'
  },
  {
    label: '操作',
    disabled: true,
    prop: 'id',
    width: '160px',
    scopedSlots: { customRender: 'operate' }
  }
]
