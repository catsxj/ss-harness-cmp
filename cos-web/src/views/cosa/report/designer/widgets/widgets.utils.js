import { cloneDeep } from 'lodash-es'
export function setStyleWithPixel(style) {
  const _style = cloneDeep(style)
  for (const key in _style) {
    if (['borderWidth', 'padding'].includes(key)) {
      _style[key] = _style[key] + 'px'
    }
  }
  return _style
}

export function packParams(insertParams, exsitParams) {
  const _params = exsitParams ? [...exsitParams] : []
  // 搜索参数藏得深：[{"param":{"last_pwd_modify_date":"2022-07-08 12:00:00"},"sign":"GET"}]
  insertParams.forEach(insertParam => {
    const idx = _params.findIndex(item => Object.keys(item.param)[0] == Object.keys(insertParam.param)[0] && item.sign == insertParam.sign)
    if (idx > -1) {
      for (const key in insertParam.param) {
        console.log(insertParam.param[key])
        if (!insertParam.param[key]) {
          _params.splice(idx, 1)
        } else {
          _params[idx] = insertParam
        }
      }
    } else {
      for (const key in insertParam.param) {
        if (insertParam.param[key]) _params.push(insertParam)
      }
    }
  })
  console.log(_params)
  return _params
}
