/**
 * Created by Zhang Haijun on 2021/2/2.
 */
// 查询参数封装优化
export function handleSearchParam(params) {
  // 设置参数
  const objParams = {}
  function setParams(sign, key, value) {
    if (objParams[sign]) {
      objParams[sign][key] = value
    } else {
      objParams[sign] = {
        [key]: value
      }
    }
  }
  // 将参数处理为对象
  for (const a in params) {
    const value = params[a]
    // 对参数进行处理，去除空参数
    if (value === '' || value === undefined || value === null) continue
    // 对key值进行处理
    const [key, sign = 'EQ'] = a.split(':')
    // 将sign全部转换为大写
    const signs = sign.toLocaleUpperCase()
    if (signs === 'RANGE') {
      const [first, second] = value
      setParams('GET', key, first)
      setParams('LET', key, second)
      continue
    }
    setParams(signs, key, value)
  }
  const result = []
  for (const a in objParams) {
    result.push({ param: objParams[a], sign: a })
  }
  return JSON.stringify(result)
}
