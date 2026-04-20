import request from 'utils/request'
import { wrapperParams } from 'utils'

const switchUrl = '/dms/v1/fabrics'
// 端口
export function getPort(params) {
  return request.get(`${switchUrl}/ports`, {
    params: params
  })
}
