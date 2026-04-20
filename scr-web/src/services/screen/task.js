import request from 'utils/request'
const baseUrl = '/cop/v1/tasks'
export function getTaskStat() {
  return request.get(`${baseUrl}/stats`)
}
const instanceUrl = '/cop/v1/tasks/instances'
export function getInstance(params) {
  return request.get(instanceUrl, {
    params
  })
}
