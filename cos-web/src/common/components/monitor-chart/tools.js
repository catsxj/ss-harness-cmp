function getSize(value, unit, precision) {
  const unitMap = {
    1: 'B',
    1024: 'KB',
    [1024 * 1024]: 'MB',
    [1024 * 1024 * 1024]: 'GB',
    [1024 * 1024 * 1024 * 1024]: 'TB'
  }
  if (value < 1024 || unit === 1024 * 1024 * 1024 * 1024) return `${value.toFixed(precision) / 1} ${unitMap[unit]}`
  return getSize(value / 1024, unit * 1024, precision)
}
export const transformKb = (value, precision = 0) => {
  return getSize(value / 1, 1024, precision)
}
