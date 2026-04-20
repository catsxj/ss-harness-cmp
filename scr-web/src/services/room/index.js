import request from 'utils/request'
export function getHosts (rackId) {
  return request.get('/ims/v1/hosts', {
    params: { page: 1, rows: 10000, params: JSON.stringify([{ param: { rackId }, sign: 'EQ' }]) }
  })
}
