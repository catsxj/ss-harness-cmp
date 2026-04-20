import request from 'utils/request'
import { wrapperParams } from 'utils'

const baseUrl = '/cms/v1/resources'
// 数据库监控
export function batchRemoveResource(params) {
  return request.delete(baseUrl, {
    data: wrapperParams(params)
  })
}
export function getOracles(params) {
  return request.get('/cms/v1/oracles', {
    params: params
  })
}
export function getOraclesDetail(id) {
  return request.get(`/cms/v1/oracles/${id}/basics`)
}
export function createOracles(params) {
  return request.post('/cms/v1/oracles', wrapperParams(params))
}
export function modifyOracles(params) {
  return request.put(`/cms/v1/oracles/${params.id}`, wrapperParams(params))
}
export function removeOracles(id) {
  return request.delete(`/cms/v1/oracles/${id}`)
}
export function getOraclesFiles(id, params) {
  return request.get(`/cms/v1/oracles/${id}/files`, {
    params: wrapperParams(params)
  })
}
export function openOracles(id, action) {
  return request.patch(`/cms/v1/oracles/${id}?action=${action}`)
}
export function getOraclesTableSpace(id) {
  return request.get(`/cms/v1/oracles/${id}/tablespaces`)
}
export function getOraclesSummary(id) {
  return request.get(`/cms/v1/oracles/${id}/summary`)
}
export function getRedis(id) {
  return request.get(`/cms/v1/redis/${id}`)
}
export function getMongodb(id) {
  return request.get(`/cms/v1/mongodb/${id}`)
}
export function getMssql(id) {
  return request.get(`/cms/v1/mssql/${id}`)
}
export function getMysqlSummary(params) {
  return request.get('/cms/v1/mysql/summary', {
    params: wrapperParams(params)
  })
}
export function getMysql(params) {
  return request.get('/cms/v1/mysql', {
    params: wrapperParams(params)
  })
}
// 新增数据库的接口
export function getRds(params) {
  return request.get('/cms/v1/rds', { params })
}

export function getRdsDetail(id) {
  return request.get(`/pms/v1/rds/${id}/basics`)
}
export function getKvs(params) {
  return request.get('/cms/v1/kvs', { params })
}

export function getKvsDetail(id) {
  return request.get(`/pms/v1/kvs/${id}/basics`)
}
