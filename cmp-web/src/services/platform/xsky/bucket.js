import request from 'utils/request'
import { wrapperParams, downloadFile as downloadFiles } from 'utils'

const baseUrl = '/dms/v1/storages/buckets'
export function getBucket(params) {
  return request.get(baseUrl, {
    params
  })
}
