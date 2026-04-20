import request from 'utils/request'
import { wrapperParams } from 'utils'

// 云主机
const vmUrl = '/ims/v1/vms'
export function getVm(params) {
  return request.get(vmUrl, {
    params
  })
}
