import request from 'utils/request'

const baseUrl = '/rms/v1/data/render'

export function getPanelList(params) {
  return request.get(baseUrl, { params })
}

export function createPanel(params) {
  return request.post(baseUrl, params)
}
export function updatePanel(params, id) {
  return request.put(`${baseUrl}/${id}`, params)
}

export function deletePanel(id) {
  return request.delete(`${baseUrl}/${id}`)
}

export function getPanelDetail(uuid) {
  return request.get(`${baseUrl}/${uuid}`)
}

export function getAuth(params) {
  return request.get('/sms/v1/permissions/tree', {
    params
  })
}

export function modifyAuth(params) {
  return request.put(`/sms/v1/permissions/${params.id}`, params)
}
