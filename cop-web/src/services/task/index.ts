import request from 'utils/request.js'

export function getNodeLogs(id: number, params: { end: boolean; priority?: number;}) {
  return request.get(`/cop/v1/tasks/instances/nodes/${id}/logs`, {
    params
  })
}
