import request from 'utils/request'

const baseUrl = 'sms/v1/tags'

export function getTags(params) {
  return request.get(baseUrl, {
    params
  })
}

export function getTagsDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}

export function createTag(params) {
  return request.post(baseUrl, {
    ...params
  })
}

export function modifyTag(params) {
  return request.put(`${baseUrl}/${params.id}`, {
    ...params
  })
}

export function removeTag(id) {
  return request.delete(`${baseUrl}/${id}`)
}
