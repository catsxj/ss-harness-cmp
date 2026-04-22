export const levelOptions = [
  { value: 'COMMON', name: '普通' },
  { value: 'MEDIUM', name: '中等' },
  { value: 'SERIOUS', name: '高危' },
  { value: 'HIGH', name: '严重' },
  { value: 'DEADLY', name: '致命' }
]
export const searchConfigs = [
  { label: '命令名称', value: 'name', type: 'Input' },
  {
    label: '命令级别',
    value: 'level',
    type: 'Select',
    data: levelOptions,
    props: {
      value: 'value'
    }
  }
]

export const columns = [
  { label: '命令名称', prop: 'name' },
  { label: '命令级别', prop: 'level', scopedSlots: { customRender: 'level' } },
  { label: '内容', prop: 'content' },
  { label: '操作', disabled: true, width: '160px', scopedSlots: { customRender: 'operate' } }
]
export function levelFilter(level: string, name: string = 'name') {
  const levelMap: any = {
    DEADLY: {
      name: '致命',
      color: 'danger'
    },
    HIGH: {
      name: '严重',
      color: 'warning'
    },
    SERIOUS: {
      name: '高危',
      color: 'normal'
    },
    MEDIUM: {
      name: '中等',
      color: 'primary'
    },
    COMMON: {
      name: '普通',
      color: 'success'
    }
  }
  return levelMap[level][name]
}
