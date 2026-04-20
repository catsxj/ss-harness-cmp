import { getCloudVendor } from 'services/platform/index'

export const columns = [
  {
    type: 'selection',
    width: 60,
    selectable(row: any) {
      const { segmentId, ip, status, osCategory } = row
      // 没有 ip，没有网络分组、非运行状态不能选择
      if (!ip || !segmentId || status !== 'RUNNING' || osCategory.toUpperCase() === 'AIX' || osCategory === 'VMware ESXi') return false
      else return true
    }
  },
  { label: '主机名', prop: 'name' },
  { label: 'IP', prop: 'ip' },
  { label: '状态', prop: 'status', scopedSlots: { customRender: 'status' } },
  {
    label: '主机类型',
    prop: 'category',
    customRender(val: string) {
      return val === 'LOGICAL' ? '云主机' : '物理机'
    }
  },
  { label: '平台名称', prop: 'vendorName' },
  { label: '系统类别', prop: 'osCategory' }
]

export const searchConfigs = [
  {
    label: '所属平台',
    value: 'vendorId',
    type: 'Select',
    service: {
      api: getCloudVendor,
      params: { simple: true },
      attr: 'data.rows'
    }
  },
  { label: 'IP地址', value: 'ip', type: 'Input' },
  { label: '主机名', value: 'name', type: 'Input' },
  { value: 'catalog', type: 'Const', initValue: 'Computer' },
  { value: 'osCategory', type: 'Const', initValue: '' }
]
