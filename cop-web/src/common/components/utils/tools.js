/**
* Created by Zhang Haijun on 2021/2/2.
*/
// 查询参数封装优化
export function handleSearchParam (params) {
  // 设置参数
  const objParams = {}
  function setParams (sign, key, value) {
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
/**
 * 判断字符类型
 * @param {*} word 字符
 * @returns 0：中文, 1: 英文, 2：数字, 3: 其他类型
 */
export const getWordType = (word) => {
  // 验证是否是中文
  const pattern0 = new RegExp('[\u4E00-\u9FA5]+');
  // 验证是否是英文
  const pattern1 = new RegExp('[A-Za-z]+');
  // 验证是否是数字
  const pattern2 = new RegExp('[0-9]+');

  if (pattern0.test(word)) {
    return 0
  } else if (pattern1.test(word)) {
    return 1
  } else if (pattern2.test(word)) {
    return 2
  } else {
    return 3
  }
}
