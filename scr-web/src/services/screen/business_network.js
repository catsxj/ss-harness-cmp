import request from 'utils/request'

export function getTopoloy (name) {
  return request.get('/cos/v1/network', {
    params: { name }
  })
}
export function getRooms () {
  return request.get('/ims/v1/rooms', {
    params: { page: 1, rows: 10000 }
  })
}

export function getHealthStatus () {
  return request.get('/cos/v1/network/switch')
}
export function getMemTop10 () {
  return request.get('/cos/v1/network/mem')
}
export function getCpuTop10 () {
  return request.get('/cos/v1/network/cpu')
}
export function getPortTop10 () {
  return request.get('/cos/v1/network/stream')
}

export function getNetworkDevice () {
  return request.get('/cos/v1/network/focus')
}
export function getAlarmList () {
  return request.get('/cos/v1/network/alert')
}

export function getNodeDetail (id, name) {
  return request.get(`/cos/v1/network/nodes/${id}`, {
    params: { name }
  })
}

export function getLinkDetail (id, name) {
  return request.get(`/cos/v1/network/edges/${id}`, {
    params: { name }
  })
}
