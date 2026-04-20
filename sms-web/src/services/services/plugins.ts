import request from 'utils/request'

interface PluginParams {
  name?: String
  code?: String
  vendor_type?: String
  status?: Boolean
  remark?: String
  id?: Number
}

interface BasicParams {
  page: Number
  rows: Number
  [key: string]: any
}

interface BindParams {
  permissionIdList: Array<Number>
  pluginsCode: String
  tenant: Boolean
}

const baseUrl = '/sms/v1/plugins'
export function getPlugins(params: BasicParams) {
  return request.get(baseUrl, { params })
}

export function getPluginsConfig(params: BasicParams) {
  return request.get(`${baseUrl}/license`, { params })
}

export function getPluginById(id: Number | String) {
  return request.get(`${baseUrl}/${id}`)
}

export function addPlugin(params: PluginParams) {
  return request.post(baseUrl, params)
}

export function editPlugin(params: PluginParams) {
  return request.put(`${baseUrl}/${params.id}`, params)
}

export function deletePlugin(id: Number | String) {
  return request.delete(`${baseUrl}/${id}`)
}

export function deleteAllPlugin(ids: any) {
  return request.delete(`${baseUrl}/remove`, { data: ids })
}

export function updateStatus(id: Number, status: Boolean) {
  return request.patch(`${baseUrl}/status`, { id, status })
}

export function associateMenu(params: BindParams) {
  return request.put('/sms/v1/permissions/binding/plugins', params)
}

export function getVendors(params: { value: String }) {
  return request.get('/sms/v1/dictionaries/children/tree', { params })
}
