/**
 * Created by Zhang Haijun on 2017/12/8.
 */
import { Message } from 'element-ui'
// 验证字段长度
export const validateLength = function (data) {
  if (data.length) data.length = parseInt(Math.abs(data.length))
  else data.length = 100
}
// 添加值
export const addItem = function (data) {
  data.push({})
}
// 删除某组件的item值
export const removeItem = function (index, data) {
  if (data.length == 1) return Message({ message: '值不能少于一项', type: 'warning' })
  data.splice(index, 1)
}
// 对最大值和最小值进行验证
export const validateValue = function (flag, data) {
  if (flag === 1 && data.minValue) {
    data.minValue = parseInt(Math.abs(data.minValue))
  } else if (data.maxValue) {
    data.maxValue = parseInt(Math.abs(data.maxValue))
  }
  if (data.minValue && data.maxValue && data.minValue > data.maxValue) {
    const sum = data.minValue / 1 + data.maxValue / 1
    data.minValue = sum - data.minValue
    data.maxValue = sum - data.minValue
  }
}
// 选中item
export const togglePopover = function (item) {
  item.selected = !item.selected
}
// 对表格的操作
export const handleOperate = function (command) {
  switch (command.flag) {
    case 1:
      command.item.splice(command.index + 1, 0, {})
      break
    case 2:
      command.item.splice(command.index, 1)
      break
    case 3:
      command.item.push({})
      break
  }
}
export const showPassword = function (data) {
  data.showType = data.showType == 'password' ? 'text' : 'password'
}
