import request from 'utils/request'

const baseUrl = 'sms/v1/tags'

export function getTags(params) {
  return request.get(baseUrl, {
    params
  })
}
