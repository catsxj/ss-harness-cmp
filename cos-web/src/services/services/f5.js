import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/ims/v1/f5'
export function applyF5(params) {
  return request.post(`${baseUrl}`, wrapperParams(params))
}
export function getF5(params) {
  return request.get(`${baseUrl}`, {
    params: params
  })
}
export function getDnsresolvers(params) {
  return request.get(`${baseUrl}/dnsresolvers`, {
    params: params
  })
}
export function getIrules(params) {
  return request.get(`${baseUrl}/irules`, {
    params: params
  })
}
export function createIrules(params) {
  return request.post(`${baseUrl}/irules`, wrapperParams(params))
}
export function modifyIrules(params) {
  return request.put(`${baseUrl}/irules/${params.id}`, wrapperParams(params))
}
export function removeIrules(id) {
  return request.delete(`${baseUrl}/irules/${id}`)
}
export function getDataGroup(params) {
  return request.get(`${baseUrl}/datagroup`, {
    params: params
  })
}
export function createDataGroup(params) {
  return request.post(`${baseUrl}/datagroup`, wrapperParams(params))
}
export function modifyDataGroup(params) {
  return request.put(`${baseUrl}/datagroup/${params.id}`, wrapperParams(params))
}
export function removeDataGroup(id) {
  return request.delete(`${baseUrl}/datagroup/${id}`)
}
export function getMonitors(params) {
  return request.get(`${baseUrl}/monitors`, {
    params: params
  })
}
export function createMonitors(params) {
  return request.post(`${baseUrl}/monitors`, wrapperParams(params))
}
export function modifyMonitors(params) {
  return request.put(`${baseUrl}/monitors/${params.id}`, wrapperParams(params))
}
export function removeMonitors(id) {
  return request.delete(`${baseUrl}/monitors/${id}`)
}
export function getMonitorsDetail(id) {
  return request.get(`${baseUrl}/monitors/${id}`)
}

export function getNodes(params) {
  return request.get(`${baseUrl}/nodes`, {
    params: params
  })
}
export function createNodes(params) {
  return request.post(`${baseUrl}/nodes`, wrapperParams(params))
}
export function modifyNodes(params) {
  return request.put(`${baseUrl}/nodes/${params.id}`, wrapperParams(params))
}
export function removeNodes(id) {
  return request.delete(`${baseUrl}/nodes/${id}`)
}
export function getNodesDetail(id) {
  return request.get(`${baseUrl}/nodes/${id}`)
}

export function getPools(params) {
  return request.get(`${baseUrl}/pools`, {
    params: params
  })
}
export function createPools(params) {
  return request.post(`${baseUrl}/pools`, wrapperParams(params))
}
export function modifyPools(params) {
  return request.put(`${baseUrl}/pools/${params.id}`, wrapperParams(params))
}
export function removePools(id) {
  return request.delete(`${baseUrl}/pools/${id}`)
}
export function getPoolsDetail(id) {
  return request.get(`${baseUrl}/pools/${id}`)
}

export function getMembers(params) {
  return request.get(`${baseUrl}/members`, {
    params: params
  })
}
export function createMembers(params) {
  return request.post(`${baseUrl}/members`, wrapperParams(params))
}
export function modifyPoolMember(params) {
  return request.put(`${baseUrl}/members/${params.id}`, wrapperParams(params))
}
export function removeMembers(id) {
  return request.delete(`${baseUrl}/members/${id}`)
}

export function getProfiles(params) {
  return request.get(`${baseUrl}/profiles`, {
    params: params
  })
}
export function createProfiles(params) {
  return request.post(`${baseUrl}/profiles`, wrapperParams(params))
}
export function modifyProfiles(params) {
  return request.put(`${baseUrl}/profiles/${params.id}`, wrapperParams(params))
}
export function removeProfiles(id) {
  return request.delete(`${baseUrl}/profiles/${id}`)
}
export function getProfilesDetail(id) {
  return request.get(`${baseUrl}/profiles/${id}`)
}

export function getSnatpools(params) {
  return request.get(`${baseUrl}/snatpools`, {
    params: params
  })
}
export function getTunnels(params) {
  return request.get(`${baseUrl}/tunnels`, {
    params: params
  })
}

export function getServers(params) {
  return request.get(`${baseUrl}/servers`, {
    params: params
  })
}
export function createServers(params) {
  return request.post(`${baseUrl}/servers`, wrapperParams(params))
}
export function modifyServers(params) {
  return request.put(`${baseUrl}/servers/${params.id}`, wrapperParams(params))
}
export function removeServers(id) {
  return request.delete(`${baseUrl}/servers/${id}`)
}
export function getServersDetail(id) {
  return request.get(`${baseUrl}/servers/${id}`)
}

export function getVlans(params) {
  return request.get(`${baseUrl}/vlans`, {
    params: params
  })
}
export function getSummary(params) {
  return request.get(`${baseUrl}/summary`, {
    params: wrapperParams(params)
  })
}
export function getDevices(params) {
  return request.get(`${baseUrl}/devices/sync`, {
    params: wrapperParams(params)
  })
}
export function syncDevices(params) {
  return request.patch(`${baseUrl}/devices/sync`, wrapperParams(params))
}
export function getPendings(params) {
  return request.get(`${baseUrl}/pending`, {
    params: params
  })
}
export function getF5Partitions(params) {
  return request.get(`${baseUrl}/auth/partition`, {
    params: params
  })
}
export function createF5Partition(params) {
  return request.post(`${baseUrl}/auth/partition`, wrapperParams(params))
}
export function removeF5Partition(id) {
  return request.delete(`${baseUrl}/auth/partition/${id}`)
}
