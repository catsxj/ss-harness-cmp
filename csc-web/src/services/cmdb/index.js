/**
 * Created by HaijunZhang on 2019/1/26.
 */
import request from 'utils/request'

// 获取正则列表
export function getReg() {
  return request.get('/ams/v1/regexps')
}
