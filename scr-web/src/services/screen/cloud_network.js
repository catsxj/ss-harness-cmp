import request from 'utils/request'

export function getOverview (params) {
  return request.get('/cos/v1/cloud/network/overview', {
    params
  })
}

export function getResource (params) {
  return request.get('/cos/v1/cloud/network/resource', {
    params
  })
}

export function getServerTrend (params) {
  return request.get('/cos/v1/cloud/network/server/trend', {
    params
  })
}

export function getTenantResource (params) {
  return request.get('/cos/v1/cloud/network/tenants/resource', {
    params
  })
}

export function getProjectResource (params) {
  return request.get('/cos/v1/cloud/network/projects/resource', {
    params
  })
}

export function getNetworks () {
  return request.get('/cos/v1/cloud/network/links')
}
export function getOrders () {
  return request.get('/cos/v1/cloud/network/tickets')
}

export function getMapRelation () {
  return request.get('/cos/v1/cloud/network/map')
}
