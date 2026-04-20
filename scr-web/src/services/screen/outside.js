import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getDcs () {
  return request.get('/ims/v1/dcs', {
    params: { page: 1, rows: 10000 }
  })
}

export function getMapToken () {
  return request.post(`${process.env.VUE_APP_MAPURL}/SIPGIS/auth/jwt/token`, {
    username: 'guest',
    password: 'guest',
    appId: 'BASE-ADMIN'
  }, {
    headers: {
      'Content-Type': 'application/json',
      'X-HW-ID': 'IOC-GIS-TEST',
      'X-HW-APPKEY': 'rqoH9mXywcFpnJLYMyRjaA==',
      options: {
        noSeri: true,
        ignoreError: true
      }
    }
  })
}
export const mapUrl = `${process.env.VUE_APP_MAPURL}${process.env.VUE_APP_MAPTILE}`
export function getMapConfig (token) {
  return request.get(mapUrl, {
    params: {
      sipsdToken: token
    },
    headers: {
      'Content-Type': 'application/json',
      'X-HW-ID': 'IOC-GIS-TEST',
      'X-HW-APPKEY': 'rqoH9mXywcFpnJLYMyRjaA==',
      options: {
        noSeri: true,
        ignoreError: true
      }
    }
  })
}

export function getOverview (dcId) {
  return request.get('/cos/v1/external/resource/overview', { params: { dcId } })
}
export function getVmApplyTrend (dcId) {
  return request.get('/cos/v1/external/vms/trend', { params: { dcId } })
}
export function getResourceApplyTrend (dcId) {
  return request.get('/cos/v1/external/resource/trend', { params: { dcId } })
}
export function getTenantResource (dcId) {
  return request.get('/cos/v1/external/tenants/resource', { params: { dcId } })
}
export function getProjectResource (dcId) {
  return request.get('/cos/v1/external/projects/resource', { params: { dcId } })
}
export function getBusinessResource (dcId) {
  return request.get('/cos/v1/external/business/resource', { params: { dcId } })
}
