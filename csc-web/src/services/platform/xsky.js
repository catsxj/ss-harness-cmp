import request from 'utils/request'
import { wrapperParams } from 'utils'

export function migrateVolume(params) {
  return request.post(`/dms/v1/volumes/${params.id}/migrate`, wrapperParams(params))
}
export function addSyncedsetsVolume(id, params) {
  return request.post(`/dms/v1/storages/syncedsets/${id}/volumes`, wrapperParams(params))
}
export function deleteSyncedsetsVolume(id, params) {
  return request.delete(`/dms/v1/storages/syncedsets/${id}/volumes`, { params: wrapperParams(params) })
}
export function getSnapshotGroup(params) {
  return request.get('/dms/v1/storages/snapshot/groups', {
    params: params
  })
}
export function addSnapshotGroup(params) {
  return request.post('/dms/v1/storages/snapshot/groups', wrapperParams(params))
}
export function modifySnapshotGroup(params) {
  return request.put(`/dms/v1/storages/snapshot/groups/${params.id}`, wrapperParams(params))
}
export function getSnapshotGroupDetail(id) {
  return request.get(`/dms/v1/storages/snapshot/groups/${id}`)
}
export function deleteSnapshotGroup(id) {
  return request.delete(`/dms/v1/storages/snapshot/groups/${id}`)
}
export function getAccessPaths(params) {
  return request.get('/dms/v1/storages/accesspaths', {
    params: params
  })
}
export function createAccessPaths(params) {
  return request.post('/dms/v1/storages/accesspaths', wrapperParams(params))
}
export function modifyAccessPaths(params) {
  return request.put(`/dms/v1/storages/accesspaths/${params.id}`, wrapperParams(params))
}
export function getAccessPathsDetail(id) {
  return request.get(`/dms/v1/storages/accesspaths/${id}`)
}
export function deleteAccessPaths(id) {
  return request.delete(`/dms/v1/storages/accesspaths/${id}`)
}
export function getPathsHosts(id, params) {
  return request.get(`/dms/v1/storages/accesspaths/${id}/hosts`, {
    params: params
  })
}
// action修改
export function getPathsHostsByInclude(id, params) {
  return request.get(`/dms/v1/storages/accesspaths/${id}/hosts/include`, {
    params: params
  })
}
export function getPathsHostsByExclude(id, params) {
  return request.get(`/dms/v1/storages/accesspaths/${id}/hosts/exclude`, {
    params: params
  })
}

export function createPathsHosts(id, params) {
  return request.post(`/dms/v1/storages/accesspaths/${id}/hosts`, wrapperParams(params))
}
export function deletePathsHosts(id, params) {
  return request.delete(`/dms/v1/storages/accesspaths/${id}/hosts`, { params: wrapperParams(params) })
}
export function getPathsViews(id, params) {
  return request.get(`/dms/v1/storages/accesspaths/${id}/views`, {
    params: params
  })
}
export function createPathsViews(id, params) {
  return request.post(`/dms/v1/storages/accesspaths/${id}/views`, wrapperParams(params))
}
export function deletePathsViews(id, params) {
  return request.delete(`/dms/v1/storages/accesspaths/${id}/views`, { params: wrapperParams(params) })
}
export function getClientGroup(id) {
  return request.get(`/dms/v1/storages/accesspaths/${id}/views/client/group`)
}
export function modifyClientGroup(id, params) {
  return request.put(`/dms/v1/storages/accesspaths/${id}/views/client/group`, wrapperParams(params))
}
export function getPathsViewsById(id, viewsId, params) {
  return request.get(`/dms/v1/storages/accesspaths/${id}/views/${viewsId}`, {
    params: params
  })
}
// action修改
export function getPathsViewsByIdByInclude(id, viewsId, params) {
  return request.get(`/dms/v1/storages/accesspaths/${id}/views/${viewsId}/include`, {
    params: params
  })
}
export function getPathsViewsByIdByExclude(id, viewsId, params) {
  return request.get(`/dms/v1/storages/accesspaths/${id}/views/${viewsId}/exclude`, {
    params: params
  })
}
export function createPathsViewsById(id, params) {
  return request.post(`/dms/v1/storages/accesspaths/${id}/views/volumes`, wrapperParams(params))
}
export function deletePathsViewsById(id, params) {
  return request.delete(`/dms/v1/storages/accesspaths/${id}/views/volumes`, { params: wrapperParams(params) })
}
export function getOsd(params) {
  return request.get('/dms/v1/ceph/osds', {
    params: params
  })
}
export function deleteOsd(id, params) {
  return request.delete(`/dms/v1/ceph/osds/${id}`, { params: wrapperParams(params) })
}
export function detailOsd(id) {
  return request.get(`/dms/v1/ceph/osds/${id}`)
}
export function addDisk(id, params) {
  return request.post(`/dms/v1/storages/pools/${id}/members`, wrapperParams(params))
}
export function deleteDisk(id, params) {
  return request.delete(`/dms/v1/storages/pools/${id}/members`, { params: wrapperParams(params) })
}
export function getDisk(params) {
  return request.get('/dms/v1/storages/pools', {
    params: params
  })
}
export function deleteHost(id) {
  return request.delete(`/dms/v1/hosts/${id}`)
}
export function createHost(params) {
  return request.post('/dms/v1/hosts', { type: 'VENDOR', ...wrapperParams(params) })
}
export function configRole(params) {
  return request.put(`/dms/v1/hosts/${params.id}`, { type: 'UPDATEROLE', ...wrapperParams(params) })
}

const baseUrl = '/dms/v1/files/systems'
export function getSystem(params) {
  return request.get(baseUrl, {
    params
  })
}

export function createSystem(params) {
  return request.post(baseUrl, wrapperParams(params))
}

export function modifySystem(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}

export function removeSystem(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function getSystemDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}

const basesUrl = '/dms/v1/files/gateways/groups'
export function getGateway(params) {
  return request.get(basesUrl, {
    params
  })
}

export function createGateway(params) {
  return request.post(basesUrl, wrapperParams(params))
}

export function modifyGateway(params) {
  return request.put(`${basesUrl}/${params.id}`, wrapperParams(params))
}

export function removeGateway(id) {
  return request.delete(`${basesUrl}/${id}`)
}

export function getGatewayDetail(id) {
  return request.get(`${basesUrl}/${id}`)
}
