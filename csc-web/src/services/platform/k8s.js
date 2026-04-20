import request from 'utils/request'
import { wrapperParams } from 'utils'

// 命名空间
const nsUrl = '/ims/v1/kubernetes/namespaces'
export function getNs(params) {
  return request.get(nsUrl, {
    params
  })
}

export function createNs(params) {
  return request.post(nsUrl, wrapperParams(params))
}

export function modifyNs(params) {
  return request.put(`${nsUrl}/${params.id}`, wrapperParams(params))
}

export function removeNs(id) {
  return request.delete(`${nsUrl}/${id}`)
}

export function detailNs(id) {
  return request.get(`${nsUrl}/${id}`)
}

export function removeNss(params) {
  return request.delete(`${nsUrl}`, { params: wrapperParams(params) })
}

export function conditionNs(params) {
  return request.get(`${nsUrl}/${params.id}`, { params })
}

// 节点
const nodeUrl = '/ims/v1/kubernetes/nodes'
export function getNode(params) {
  return request.get(nodeUrl, {
    params
  })
}

export function createNode(params) {
  return request.post(nodeUrl, wrapperParams(params))
}

export function modifyNode(params) {
  return request.put(`${nodeUrl}/${params.id}`, wrapperParams(params))
}

export function removeNode(id) {
  return request.delete(`${nodeUrl}/${id}`)
}

export function detailNode(id) {
  return request.get(`${nodeUrl}/${id}`)
}

export function removeNodes(params) {
  return request.delete(`${nodeUrl}`, { params: wrapperParams(params) })
}

export function conditionNode(params) {
  return request.get(`${nodeUrl}/${params.id}`, { params })
}

export function patchSchedule(action, params) {
  return request.patch(`${nodeUrl}/${params.id}`, { action: action, ...wrapperParams(params) })
}

// 服务
const serviceUrl = '/ims/v1/kubernetes/services'
export function getService(params) {
  return request.get(serviceUrl, {
    params
  })
}

export function createService(params) {
  return request.post(serviceUrl, wrapperParams(params))
}

export function modifyService(params) {
  return request.put(`${serviceUrl}/${params.id}`, wrapperParams(params))
}

export function removeService(id) {
  return request.delete(`${serviceUrl}/${id}`)
}

export function detailService(id) {
  return request.get(`${serviceUrl}/${id}`)
}

export function removeServices(params) {
  return request.delete(`${serviceUrl}`, { params: wrapperParams(params) })
}

export function conditionService(params) {
  return request.get(`${serviceUrl}/${params.id}`, { params })
}

// 容器组
const podUrl = '/ims/v1/kubernetes/pods'
export function getPod(params) {
  return request.get(podUrl, {
    params
  })
}

export function createPod(params) {
  return request.post(podUrl, wrapperParams(params))
}

export function modifyPod(params) {
  return request.put(`${podUrl}/${params.id}`, wrapperParams(params))
}

export function removePod(id) {
  return request.delete(`${podUrl}/${id}`)
}

export function detailPod(id) {
  return request.get(`${podUrl}/${id}`)
}

export function removePods(params) {
  return request.delete(`${podUrl}`, { params: wrapperParams(params) })
}

export function conditionPod(params) {
  return request.get(`${podUrl}/${params.id}`, { params })
}

// 部署
const deploymentsUrl = '/ims/v1/kubernetes/deployments'
export function getDeployments(params) {
  return request.get(deploymentsUrl, {
    params
  })
}

export function createDeployments(params) {
  return request.post(deploymentsUrl, wrapperParams(params))
}

export function modifyDeployments(params) {
  return request.put(`${deploymentsUrl}/${params.id}`, wrapperParams(params))
}

export function removeDeployments(id) {
  return request.delete(`${deploymentsUrl}/${id}`)
}

export function detailDeployments(id) {
  return request.get(`${deploymentsUrl}/${id}`)
}

export function removeDeploymentss(params) {
  return request.delete(`${deploymentsUrl}`, { params: wrapperParams(params) })
}

export function conditionDeployments(params) {
  return request.get(`${deploymentsUrl}/${params.id}`, { params })
}

// 部署
const storageUrl = '/ims/v1/kubernetes/pvs'
export function getSorage(params) {
  return request.get(storageUrl, {
    params
  })
}

export function createSorage(params) {
  return request.post(storageUrl, wrapperParams(params))
}

export function modifySorage(params) {
  return request.put(`${storageUrl}/${params.id}`, wrapperParams(params))
}

export function removeSorage(id) {
  return request.delete(`${storageUrl}/${id}`)
}

export function detailSorage(id) {
  return request.get(`${storageUrl}/${id}`)
}

export function removeSorages(params) {
  return request.delete(`${storageUrl}`, { params: wrapperParams(params) })
}

export function conditionSorage(params) {
  return request.get(`${storageUrl}/${params.id}`, { params })
}

const daemonSetUrl = '/ims/v1/kubernetes/daemonsets'
export function getDaemonSet(params) {
  return request.get(daemonSetUrl, {
    params
  })
}

export function createDaemonSet(params) {
  return request.post(daemonSetUrl, wrapperParams(params))
}

export function modifyDaemonSet(params) {
  return request.put(`${daemonSetUrl}/${params.id}`, wrapperParams(params))
}

export function removeDaemonSet(id) {
  return request.delete(`${daemonSetUrl}/${id}`)
}

export function detailDaemonSet(id) {
  return request.get(`${daemonSetUrl}/${id}`)
}

export function removeDaemonSets(params) {
  return request.delete(`${daemonSetUrl}`, { params: wrapperParams(params) })
}

export function conditionDaemonSet(params) {
  return request.get(`${daemonSetUrl}/${params.id}`, { params })
}
