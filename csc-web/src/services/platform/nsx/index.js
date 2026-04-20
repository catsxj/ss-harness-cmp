import request from 'utils/request'
import { wrapperParams } from 'utils'

// tier0
const tier0Url = '/nms/v1/nsx/tier-zeros'
export function getTier0(params) {
  return request.get(tier0Url, {
    params
  })
}

export function createTier0(params) {
  return request.post(tier0Url, wrapperParams(params))
}

export function modifyTier0(params) {
  return request.put(`${tier0Url}/${params.id}`, wrapperParams(params))
}

export function removeTier0(id) {
  return request.delete(`${tier0Url}/${id}`)
}
export function batchRemoveTier0(params) {
  return request.delete(`${tier0Url}`, {
    data: wrapperParams(params)
  })
}

export function getTier0Detail(id) {
  return request.get(`${tier0Url}/${id}`)
}

// tier1
const tier1Url = '/nms/v1/nsx/tier-ones'
export function getTier1(params) {
  return request.get(tier1Url, {
    params
  })
}

export function createTier1(params) {
  return request.post(tier1Url, wrapperParams(params))
}

export function modifyTier1(params) {
  return request.put(`${tier1Url}/${params.id}`, wrapperParams(params))
}

export function removeTier1(id) {
  return request.delete(`${tier1Url}/${id}`)
}

export function batchRemoveTier1(params) {
  return request.delete(`${tier1Url}`, {
    data: wrapperParams(params)
  })
}

export function getTier1Detail(id) {
  return request.get(`${tier1Url}/${id}`)
}

export function removeTier1s(params) {
  return request.delete(`${tier1Url}`, { params: wrapperParams(params) })
}

export function conditionTier1(params) {
  return request.get(`${tier1Url}/${params.id}`, { params })
}

export function patchSchedule(action, params) {
  return request.patch(`${tier1Url}/${params.id}`, { action: action, ...wrapperParams(params) })
}

// 分段
const segmentUrl = '/nms/v1/nsx/segments'
export function getSegment(params) {
  return request.get(segmentUrl, {
    params
  })
}

export function createSegment(params) {
  return request.post(segmentUrl, wrapperParams(params))
}

export function modifySegment(params) {
  return request.put(`${segmentUrl}/${params.id}`, wrapperParams(params))
}

export function removeSegment(id) {
  return request.delete(`${segmentUrl}/${id}`)
}

export function batchRemoveSegment(params) {
  return request.delete(`${segmentUrl}`, {
    data: wrapperParams(params)
  })
}

export function getSegmentDetail(id) {
  return request.get(`${segmentUrl}/${id}`)
}

// 传输区域
const zoneUrl = '/nms/v1/nsx/transport-zones'
export function getTransZone(params) {
  return request.get(zoneUrl, {
    params
  })
}

export function createTransZone(params) {
  return request.post(zoneUrl, wrapperParams(params))
}

export function modifyTransZone(params) {
  return request.put(`${zoneUrl}/${params.id}`, wrapperParams(params))
}

export function removeTransZone(id) {
  return request.delete(`${zoneUrl}/${id}`)
}

export function getTransZoneDetail(id) {
  return request.get(`${zoneUrl}/${id}`)
}

// 逻辑交换机
const switchUrl = '/nms/v1/nsx/logical-switches'
export function getLogicalSwitch(params) {
  return request.get(switchUrl, {
    params
  })
}

export function createLogicalSwitch(params) {
  return request.post(switchUrl, wrapperParams(params))
}

export function modifyLogicalSwitch(params) {
  return request.put(`${switchUrl}/${params.id}`, wrapperParams(params))
}

export function removeLogicalSwitch(id) {
  return request.delete(`${switchUrl}/${id}`)
}

export function batchRemoveLogicalSwitch(params) {
  return request.delete(`${switchUrl}`, {
    data: wrapperParams(params)
  })
}

export function getLogicalSwitchDetail(id) {
  return request.get(`${switchUrl}/${id}`)
}
// 创建子网
export function createSwitchSubnet(params) {
  return request.post(`${switchUrl}/subnets`, wrapperParams(params))
}

// ns组
const nsUrl = '/nms/v1/nsx/ns-groups'
export function getNsGroup(params) {
  return request.get(nsUrl, {
    params
  })
}

export function createNsGroup(params) {
  return request.post(nsUrl, wrapperParams(params))
}

export function modifyNsGroup(params) {
  return request.put(`${nsUrl}/${params.id}`, wrapperParams(params))
}

export function removeNsGroup(id) {
  return request.delete(`${nsUrl}/${id}`)
}

export function batchRemoveNsGroup(params) {
  return request.delete(`${nsUrl}`, {
    data: wrapperParams(params)
  })
}

export function getNsGroupDetail(id) {
  return request.get(`${nsUrl}/${id}`)
}
