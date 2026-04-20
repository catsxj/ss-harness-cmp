import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getRds(params) {
  return request.get('/pms/v1/rds', { params })
}

export function getRdsDetail(id) {
  return request.get(`/pms/v1/rds/${id}`)
}

export function deleteRds(id) {
  return request.delete(`/pms/v1/rds/${id}`)
}

export function patchRds(id) {
  return request.patch(`/pms/v1/rds/${id}`)
}

export function patchActionRds(action, params) {
  return request.patch(`/pms/v1/rds/${params.id}`, { action: action, ...wrapperParams(params) })
}

export function patchActionRdsNodes(action, params) {
  return request.patch(`/pms/v1/rds/nodes/${params.id}`, { action: action, ...wrapperParams(params) })
}

export function getRdsConnections(params) {
  return request.get('/pms/v1/rds/connections', { params })
}

export function getRdsLogs(params) {
  return request.get('/pms/v1/rds/logs', { params })
}

export function getRdsBackups(params) {
  return request.get(`/pms/v1/rds/${params.id}/backups`, { params })
}

export function removeRdsBackups(id) {
  return request.delete(`/pms/v1/rds/backups/${id}`)
}

export function getRdsSecuritiess(params) {
  return request.get(`/pms/v1/rds/${params.id}/securities`, { params })
}

export function getRdsParameters(params) {
  return request.get(`/pms/v1/rds/${params.id}/parameters`, { params })
}

export function modifyRdsParameters(params) {
  return request.put('/pms/v1/rds/parameters/setting', wrapperParams(params))
}

export function getRdsParametersLogs(params) {
  return request.get('/pms/v1/rds/parameters/logs', { params })
}

export function getRdsDbs(params) {
  return request.get('/pms/v1/rds/dbs', { params })
}

export function createRdsDbs(params) {
  return request.post('/pms/v1/rds/dbs', wrapperParams(params))
}

export function removeRdsDbs(id) {
  return request.delete(`/pms/v1/rds/dbs/${id}`)
}

export function getRdsUsers(params) {
  return request.get('/pms/v1/rds/users', { params })
}

export function createRdsUsers(params) {
  return request.post('/pms/v1/rds/users', wrapperParams(params))
}

export function patchRdsUsers(action, params) {
  return request.patch(`/pms/v1/rds/users/${params.id}`, { action: action, ...wrapperParams(params) })
}

export function removeRdsUsers(id) {
  return request.delete(`/pms/v1/rds/users/${id}`)
}

export function getKvs(params) {
  return request.get('/pms/v1/kvs', { params })
}

export function getKvsDetail(id) {
  return request.get(`/pms/v1/kvs/${id}`)
}

export function deleteKvs(id) {
  return request.delete(`/pms/v1/kvs/${id}`)
}

export function patchKvs(id) {
  return request.patch(`/pms/v1/kvs/${id}`)
}

export function patchActionKvs(action, params) {
  return request.patch(`/pms/v1/kvs/${params.id}`, { action: action, ...wrapperParams(params) })
}

export function patchActionKvsNodes(action, params) {
  return request.patch(`/pms/v1/kvs/nodes/${params.id}`, { action: action, ...wrapperParams(params) })
}

export function getKvsConnections(params) {
  return request.get('/pms/v1/kvs/connections', { params })
}

export function getKvsLogs(params) {
  return request.get('/pms/v1/kvs/logs', { params })
}

export function getKvsBackups(params) {
  return request.get(`/pms/v1/kvs/${params.id}/backups`, { params })
}

export function removeKvsBackups(id) {
  return request.delete(`/pms/v1/rds/backups/${id}`)
}

export function getKvsSecuritiess(params) {
  return request.get(`/pms/v1/kvs/${params.id}/securities`, { params })
}

export function getKvsParameters(params) {
  return request.get(`/pms/v1/kvs/${params.id}/parameters`, { params })
}

export function modifyKvsParameters(params) {
  return request.put('/pms/v1/kvs/parameters/setting', wrapperParams(params))
}

export function getKvsParametersLogs(params) {
  return request.get('/pms/v1/kvs/parameters/logs', { params })
}

export function getKvsDbs(params) {
  return request.get('/pms/v1/kvs/dbs', { params })
}

export function getKvsUsers(params) {
  return request.get('/pms/v1/kvs/dbs', { params })
}

export function createKvsUsers(params) {
  return request.post('/pms/v1/kvs/users', wrapperParams(params))
}

export function patchKvsUsers(action, params) {
  return request.patch(`/pms/v1/kvs/users/${params.id}`, { action: action, ...wrapperParams(params) })
}

export function removeKvsUsers(id) {
  return request.delete(`/pms/v1/kvs/dbs/${id}`)
}
