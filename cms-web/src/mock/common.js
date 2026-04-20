/**
 * Created by Zhang Haijun on 2018/3/20.
 */
import Mock from 'mockjs'
const commonData = {
  success: true,
  message: '查询成功',
  data: []
}
export default {
  getList(template, count = 10, total = 50) {
    const list = []
    for (let i = 0; i < count; i++) {
      list.push(Mock.mock(template))
    }
    commonData.data = {
      rows: list,
      total: total
    }
    return commonData
  },
  getDetail(template) {
    commonData.data = Mock.mock(template)
    return commonData
  }
}
