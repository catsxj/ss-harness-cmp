import request from 'utils/request'
import { wrapperParams } from 'utils'

export function createCmsTopics(params) {
  return request.post(`/pms/v1/cms/${params.mqId}/topics`, wrapperParams(params))
}
export function removeCmsTopics(params) {
  return request.delete(`/pms/v1/cms/${params.mqId}/topics/${params.topicId}`, { params: wrapperParams(params) })
}
export function removeCmsConnections(mqId, params) {
  return request.delete(`/pms/v1/cms/${mqId}/connections`, { params: wrapperParams(params) })
}

export function getCms(params) {
  return request.get('/pms/v1/cms', { params })
}

export function getCmsDetail(id) {
  return request.get(`/pms/v1/cms/${id}`)
}

export function deleteCms(id) {
  return request.delete(`/pms/v1/cms/${id}`)
}

export function getCmsTopics(id, params) {
  return request.get(`/pms/v1/cms/${id}/topics`, { params })
}
export function createMqsTopics(params) {
  return request.post(`/pms/v1/cms/${params.mqId}/topics`, wrapperParams(params))
}
export function removeMqsTopics(params) {
  return request.delete(`/pms/v1/cms/${params.mqId}/topics/${params.topicId}`, { params: wrapperParams(params) })
}
export function createTopicsPartitions(params) {
  return request.patch(`/pms/v1/cms/${params.mqId}/topics/${params.topicId}`, wrapperParams(params))
}
export function getMqUserPermissions(params) {
  return request.get(`/pms/v1/cms/${params.id}/users/${params.name}/permissions`)
}
export function createMqUserPermissions(params) {
  return request.post(`/pms/v1/cms/${params.id}/users/${params.name}/permissions`, wrapperParams(params))
}
export function removeMqUserPermissions(params) {
  return request.delete(`/pms/v1/cms/${params.id}/users/${params.name}/permissions`, { params: wrapperParams(params) })
}
export function createMqUser(params) {
  return request.post(`/pms/v1/cms/${params.id}/users`, wrapperParams(params))
}
export function removeMqUser(params) {
  return request.delete(`/pms/v1/cms/${params.id}/users/${params.name}`, { params: wrapperParams(params) })
}
export function modisyMqUser(params) {
  return request.put(`/pms/v1/cms/${params.id}/users/${params.name}`, wrapperParams(params))
}
export function createMqVhosts(params) {
  return request.post(`/pms/v1/cms/${params.id}/vhosts`, wrapperParams(params))
}
export function removeMqVhosts(params) {
  return request.delete(`/pms/v1/cms/${params.id}/vhosts/${params.name}`, { params: wrapperParams(params) })
}
export function getMqVhostsPermissions(params) {
  return request.get(`/pms/v1/cms/${params.id}/vhosts/${params.name}/permissions`)
}
export function createMqVhostsPermissions(params) {
  return request.post(`/pms/v1/cms/${params.id}/vhosts/${params.name}/permissions`, wrapperParams(params))
}
export function removeMqVhostsPermissions(params) {
  return request.delete(`/pms/v1/cms/${params.id}/vhosts/${params.name}/permissions`, { params: wrapperParams(params) })
}
export function getCmsConnections(id, params) {
  return request.get(`/pms/v1/cms/${id}/connections`, { params })
}
export function getCmsConnectionsDetail(mqId, name) {
  return request.get(`/pms/v1/cms/${mqId}/connections/${name}`)
}
export function removeMqsConnections(mqId, params) {
  return request.delete(`/pms/v1/cms/${mqId}/connections/${params.name}`, { params: wrapperParams(params) })
}
export function getCmsChannels(id, params) {
  return request.get(`/pms/v1/cms/${id}/channels`, { params })
}
export function getCmsChannelsDetail(mqId, name) {
  return request.get(`/pms/v1/cms/${mqId}/channels/${name}`)
}
export function getCmsExchanges(id, params) {
  return request.get(`/pms/v1/cms/${id}/exchanges`, { params })
}
export function getCmsExchangesDetail(mqId, vhost, name) {
  return request.get(`/pms/v1/cms/${mqId}/exchanges/${vhost}/${name}`)
}
export function getCmsQueues(id, params) {
  return request.get(`/pms/v1/cms/${id}/queues`, { params })
}
export function getCmsQueuesDetail(mqId, vhost, name) {
  return request.get(`/pms/v1/cms/${mqId}/queues/${vhost}/${name}`)
}
export function getCmsVhosts(id, params) {
  return request.get(`/pms/v1/cms/${id}/vhosts`, { params })
}
export function getCmsUsers(id, params) {
  return request.get(`/pms/v1/cms/${id}/users`, { params })
}
export function getLogs(params) {
  return request.get('/pms/v1/cms/logs', { params })
}

export function getCmsBackups(params) {
  return request.get(`/pms/v1/cms/${params.id}/backups`, { params })
}

export function removeCmsBackups(id) {
  return request.delete(`/pms/v1/cms/backups/${id}`)
}

export function patchActionCms(action, params) {
  return request.patch(`/pms/v1/cms/${params.id}`, { action: action, ...wrapperParams(params) })
}

export function patchActionCmsNodes(action, params) {
  return request.patch(`/pms/v1/cms/nodes/${params.id}`, { action: action, ...wrapperParams(params) })
}
