import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'

const imageUrl = '/ims/v1/images'
export function getImage(params) {
  return request.get(imageUrl, {
    params: {
      type: 'INSTALLATION',
      ...params
    }
  })
}
export function getImageDetail(id) {
  return request.get(`${imageUrl}/${id}`, {
    params: {
      type: 'INSTALLATION'
    }
  })
}
export function createImage(params) {
  return request.post(imageUrl, {
    type: 'INSTALLATION',
    ...wrapperParams(params)
  })
}
export function modifyImage(params) {
  return request.put(`${imageUrl}/${params.id}`, {
    type: 'INSTALLATION',
    ...wrapperParams(params)
  })
}
export function removeImage(params) {
  return request.delete(`${imageUrl}/${params.id}`, { params: { type: 'INSTALLATION', ...wrapperParams(params) } })
}
export function syncImage() {
  return request.patch(`${imageUrl}/0`, {
    type: 'INSTALLATION',
    action: 'sync'
  })
}
export function isoImage() {
  return request.get(`${imageUrl}/iso`, {
    params: {
      type: 'INSTALLATION'
    }
  })
}

export function getTaskHistory(params) {
  return request.get('/ims/v1/installations', {
    params: params
  })
}
export function getTaskHistoryDetail(id) {
  return request.get(`/ims/v1/installations/${id}`)
}
const baseUrl = '/ims/v1/hosts'

export function getHost(params) {
  return request.get(baseUrl, {
    params: {
      type: 'INSTALLATION',
      ...params
    }
  })
}
export function getHostDetail(id, params) {
  return request.get(`${baseUrl}/${id}`, {
    params: {
      type: 'INSTALLATION',
      ...params
    }
  })
}
export function addHost(params) {
  return request.post(baseUrl, {
    type: 'INSTALLATION',
    ...wrapperParams(params)
  })
}
export function removeHost(params) {
  return request.delete(`${baseUrl}/${params.id}`, { params: { type: 'INSTALLATION', ...wrapperParams(params) } })
}
export function removeBatchHost(params) {
  return request.delete(`${baseUrl}`, { params: { type: 'INSTALLATION', ...wrapperParams(params) } })
}
export function batchRemoveHost(params) {
  return request.delete(baseUrl, {
    data: { type: 'INSTALLATION', ...wrapperParams(params) }
  })
}
export function operateHost(id, action, params) {
  return request.patch(`${baseUrl}/${id}`, {
    type: 'INSTALLATION',
    action: action,
    ...wrapperParams(params)
  })
}
export function installHost(action, params) {
  return request.patch(baseUrl, {
    type: 'INSTALLATION',
    action: action,
    ...wrapperParams(params)
  })
}
export function getMetrics(params) {
  return request.get(`${baseUrl}/${params.id}/metrics`, {
    params: {
      type: 'INSTALLATION',
      ...params
    }
  })
}
export function getInsHistory(id, params) {
  return request.get(`${baseUrl}/${id}/installations`, {
    params: {
      type: 'INSTALLATION',
      ...params
    }
  })
}
export function getIpmiUsers(id, params) {
  return request.get(`${baseUrl}/${id}/ipmi/users`, {
    params: {
      type: 'INSTALLATION',
      ...params
    }
  })
}

const yumUrl = '/ims/v1/repos/yum'
export function getRepos(params) {
  return request.get(yumUrl, {
    params: params
  })
}
export function createRepos(params) {
  return request.post(yumUrl, wrapperParams(params))
}
export function modifyRepos(params) {
  return request.put(`${yumUrl}/${params.name}`, wrapperParams(params))
}
export function removeRepos(name) {
  return request.delete(`${yumUrl}/${name}`)
}
export function configureYum(params) {
  return request.patch(`${yumUrl}/${params.name}`, wrapperParams(params))
}
export function downloadTemplate(params) {
  downloadFile(`${baseUrl}`, {
    condition: 'download',
    type: 'INSTALLATION',
    params
  })
}
export function controlHost(id) {
  return request.get(`/ims/v1/hosts/${id}/console`, {
    headers: { options: { ignoreError: true } },
    params: {
      type: 'INSTALLATION'
    }
  })
}
