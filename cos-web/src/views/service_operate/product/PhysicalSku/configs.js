export const cpuStatusFilter = (value, type) => {
  const statusMap = {
    1: '已启用',
    0: '已禁用'
  }
  const colorMap = {
    1: 'success',
    0: 'danger'
  }
  return type == 'color' ? colorMap[value] : statusMap[value]
}
export const cpuFrameworkList = [
  { name: 'X86', id: 'X86' },
  { name: 'ARM', id: 'ARM' },
  { name: 'C86', id: 'C86' }
]
export const cpuFrameworkMap = {
  X86: 'X86',
  ARM: 'ARM',
  C86: 'C86'
}
