import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'
const pmUrl = '/ims/v1/pm'
export function getServerList(params) {
  return request(`${pmUrl}/list`, { params })
}

export function removeServer(id) {
  return request(`${pmUrl}/delete`, { params: { id } })
}

// 导出物理服务器
export function exportServerList(params) {
  downloadFile(`${pmUrl}/export`, params)
}
