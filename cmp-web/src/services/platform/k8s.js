import request from 'utils/request'
import { wrapperParams } from 'utils'

// 节点
const nodeUrl = '/ims/v1/kubernetes/nodes'
export function getNode(params) {
  return request.get(nodeUrl, {
    params
  })
}

// 服务
const serviceUrl = '/ims/v1/kubernetes/services'
export function getService(params) {
  return request.get(serviceUrl, {
    params
  })
}

// 容器组
const podUrl = '/ims/v1/kubernetes/pods'
export function getPod(params) {
  return request.get(podUrl, {
    params
  })
}
