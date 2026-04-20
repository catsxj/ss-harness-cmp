import request from 'utils/request'
import { wrapperParams } from 'utils'

const vmUrl = '/ims/v1/h3c/vms'

// 打开/关闭云主机
export function vm(id, action, params) {
  return request.patch(`${vmUrl}/${id}`, { action: action })
}

export function vmConsole(id) {
  return request.get(`${vmUrl}/${id}/console`)
}

const clusterUrl = '/ims/v1/h3c/clusters'
export function createCluster(params) {
  return request.post(clusterUrl, { params })
}

export function getCluster(params) {
  return request.get(clusterUrl, { params })
}

export function removeCluster(id) {
  return request.delete(`${clusterUrl}/${id}`)
}

export function getClusterFiles(id) {
  return request.get(`${clusterUrl}/${id}/files`)
}

// 创建主机
export function createHosts(params) {
  return request.get('/ims/v1/h3c/hosts', { params })
}

// 主机池
const hostPoolUrl = '/ims/v1/h3c/pools'
export function createHostsPool(params) {
  return request.get(hostPoolUrl, wrapperParams(params))
}

export function removeHostsPool(id) {
  return request.delete(`${hostPoolUrl}/${id}`)
}

// 交换机
export function getSwitch(id) {
  return request.get(`/ims/v1/h3c/networks/${id}/files`)
}

// 物理网卡
export function getNetcards(id) {
  return request.get(`/ims/v1/h3c/networks/${id}/netcards`)
}

export function getSwitches(id) {
  return request.get(`/ims/v1/h3c/networks/${id}/switches`)
}

// 快照
const snapshotUrl = '/ims/v1/h3c/snapshots'
export function createSnapshot(params) {
  return request.get(snapshotUrl, wrapperParams(params))
}

export function removeSnapshot(id) {
  return request.delete(`${snapshotUrl}/${id}`)
}

export function resetSnapshot(id) {
  return request.patch(`${snapshotUrl}/${id}`, { action: 'revert' })
}
