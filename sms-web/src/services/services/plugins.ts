import request from 'utils/request'

interface PluginParams {
  name?: string
  code?: string
  vendor_type?: string
  status?: boolean
  remark?: string
  id?: number
}

interface BasicParams {
  page: number
  rows: number
  [key: string]: any
}

interface BindParams {
  permissionIdList: Array<number>
  pluginsCode: string
  tenant: boolean
}

const baseUrl = '/sms/v1/plugins'
export function getPlugins(params: BasicParams) {
  return request.get(baseUrl, { params })
}

export function getPluginsConfig(params: BasicParams) {
  return request.get(`${baseUrl}/license`, { params })
}

export function getPluginById(id: number | string) {
  return request.get(`${baseUrl}/${id}`)
}

export function addPlugin(params: PluginParams) {
  return request.post(baseUrl, params)
}

export function editPlugin(params: PluginParams) {
  return request.put(`${baseUrl}/${params.id}`, params)
}

export function deletePlugin(id: number | string) {
  return request.delete(`${baseUrl}/${id}`)
}

export function deleteAllPlugin(ids: any) {
  return request.delete(`${baseUrl}/remove`, { data: ids })
}

export function updateStatus(id: number, status: boolean) {
  return request.patch(`${baseUrl}/status`, { id, status })
}

export function associateMenu(params: BindParams) {
  return request.put('/sms/v1/permissions/binding/plugins', params)
}

export function getVendors(params: { value: string }) {
  return request.get('/sms/v1/dictionaries/children/tree', { params })
}
