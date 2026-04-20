import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getResourcePool(params) {
  return request.get('/cms/v1/fusioncloud/resource-pools', {
    params: wrapperParams(params)
  })
}
export function getResourcPoolsDashboard(params) {
  return request.get(`/cms/v1/fusioncloud/capacity/resource-pools/${params.id}/statistics`, {
    params: wrapperParams(params)
  })
}
export function getAzoneDashboard(params) {
  return request.get(`/cms/v1/fusioncloud/capacity/azones/${params.id}/statistics`, {
    params: wrapperParams(params)
  })
}
export function getResourceCapacities(params) {
  return request.get(`/cms/v1/fusioncloud/capacity/resource-pools/${params.id}/current-capacities`, {
    params: wrapperParams(params)
  })
}
export function getAzoneCapacities(params) {
  return request.get(`/cms/v1/fusioncloud/capacity/azones/${params.id}/current-capacities`, {
    params: wrapperParams(params)
  })
}
export function getStorageResDashboard(params) {
  return request.get(`/cms/v1/fusioncloud/capacity/resource-pools/${params.id}/resource-types/storage-pool/capacities`, {
    params: wrapperParams(params)
  })
}
export function getStorageAzoneDashboard(params) {
  return request.get(`/cms/v1/fusioncloud/capacity/azones/${params.id}/resource-types/storage-pool/capacities`, {
    params: wrapperParams(params)
  })
}
