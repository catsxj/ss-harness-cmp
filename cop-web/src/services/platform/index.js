import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'
// 资源
const resourceUrl = '/ims/v1/resources'
export function getResource(params) {
  return request.get(resourceUrl, {
    params
  })
}

export function detailResource(id) {
  return request.get(`${resourceUrl}/${id}`)
}

// 平台
export function getCloudVendor(params, url) {
  return request.get(`${url || '/ims/v1/vendors'}`, {
    params
  })
}

export function shoppingCloudServices(params) {
  return request.post('/cos/v1/cloudservices/shopping', wrapperParams(params))
}

const imageUrl = '/ims/v1/images'
export function getImage(params) {
  return request.get(imageUrl, {
    params
  })
}
export function conditionImage(obj) {
  const params = { condition: JSON.stringify(obj) }
  return request.get(`${imageUrl}/condition`, { params })
}
// vpc
export function getVpc(params) {
  return request.get('/ims/v1/vpcs', { params })
}
// 虚拟机
const vmUrl = '/ims/v1/vms'
export function getVm(params) {
  return request.get(vmUrl, { params })
}
export function conditionVm(obj) {
  const params = { condition: JSON.stringify(obj) }
  return request.get(`${vmUrl}/condition`, { params })
}
// 快照
export function getSnapshot(params) {
  return request.get('/ims/v1/snapshots', {
    params
  })
}
// volume
export function getVolume(params, url) {
  return request.get(url || '/ims/v1/volumes', {
    params
  })
}
// 子网
export function getSubnet(params) {
  return request.get('/ims/v1/subnets', {
    params
  })
}
// 规格
export function getFlavor(params) {
  return request.get('/ims/v1/flavors', {
    params
  })
}
// 弹性IP
export function getListEip(params) {
  return request.get('/ims/v1/elasticips/frees', {
    params: wrapperParams(params)
  })
}

export function conditionIp(params) {
  return request.get('/ims/v1/ips/condition', { params })
}

// 浮动IP
export function getIp(params) {
  return request.get('/ims/v1/ips', {
    params
  })
}

// IP池
export function getIpPool(params) {
  return request.get('/ims/v1/ip/pools', {
    params
  })
}
// 安全组
export function getGroup(params) {
  return request.get('/ims/v1/sgroups', {
    params
  })
}
// 密钥
export function getKey(params) {
  return request.get('/ims/v1/keypairs', {
    params
  })
}
// 网络
const networkUrl = '/ims/v1/networks'
export function getNetwork(params) {
  return request.get(networkUrl, {
    params
  })
}
export function conditionNetwork(obj) {
  const params = { condition: JSON.stringify(obj) }
  return request.get(`${networkUrl}/condition`, { params })
}
// 路由
export function getRouter(params) {
  return request.get('/ims/v1/routers', {
    params
  })
}
// 防火墙规则
export function getFirewallRule(params) {
  return request.get('/ims/v1/firewalls/rules', {
    params
  })
}
// 防火墙策略
export function getFirewallPolicy(params) {
  return request.get('/ims/v1/firewalls/policies', {
    params
  })
}
// 防火墙
export function getFirewall(params) {
  return request.get('/ims/v1/firewalls', {
    params
  })
}
// 负载均衡
export function getLb(params) {
  return request.get('/ims/v1/lbs', {
    params
  })
}

export function getLbListen(params) {
  return request.get('/ims/v1/lb/listeners', {
    params
  })
}
// 区域
export function getRegionCondition(params) {
  return request.get('/ims/v1/regions/condition', { params: { condition: JSON.stringify(params) } })
}
