import request from 'utils/request'
import { wrapperParams } from 'utils'
const baseUrl = '/nms/v1/hillstone'
export function getArpBind(params) {
  return request.get(`${baseUrl}/arpbind`, {
    params: params
  })
}

export function getArpauth(params) {
  return request.get(`${baseUrl}/arpauth`, {
    params: params
  })
}

export function getArpcheck(params) {
  return request.get(`${baseUrl}/arpcheck`, {
    params: params
  })
}

export function getAaaServer(params) {
  return request.get(`${baseUrl}/aaaserver`, {
    params: params
  })
}

export function getApplicationbook(params) {
  return request.get(`${baseUrl}/applicationbook`, {
    params: params
  })
}

export function getApplicationstaticfeaturerule(params) {
  return request.get(`${baseUrl}/applicationstaticfeaturerule`, {
    params: params
  })
}

export function getConfigFile(params) {
  return request.get(`${baseUrl}/configbackup`, {
    params: params
  })
}

export function getIspInfo(params) {
  return request.get(`${baseUrl}/ispinfo`, {
    params: params
  })
}

export function getUserGroup(params) {
  return request.get(`${baseUrl}/localusergroup`, {
    params: params
  })
}

export function getUsers(params) {
  return request.get(`${baseUrl}/localuser`, {
    params: params
  })
}
export function createUserGroup(params) {
  return request.post(`${baseUrl}/localusergroup`, wrapperParams(params))
}
export function modifyUserGroup(params) {
  return request.put(`${baseUrl}/localusergroup/${params.id}`, wrapperParams(params))
}
export function removeUserGroup(id) {
  return request.delete(`${baseUrl}/localusergroup/${id}`)
}
export function createUser(params) {
  return request.post(`${baseUrl}/localuser`, wrapperParams(params))
}
export function modifyUser(params) {
  return request.put(`${baseUrl}/localuser/${params.id}`, wrapperParams(params))
}
export function removeUser(id) {
  return request.delete(`${baseUrl}/localuser/${id}`)
}
export function getMonitorbook(params) {
  return request.get(`${baseUrl}/monitorbook`, {
    params: params
  })
}

export function getSlbservicetype(params) {
  return request.get(`${baseUrl}/slbservicetype`, {
    params: params
  })
}

export function getTimebook(params) {
  return request.get(`${baseUrl}/timebook`, {
    params: params
  })
}

export function getVirtualroute(params) {
  return request.get(`${baseUrl}/virtualroute`, {
    params: params
  })
}

export function getVirtualswitch(params) {
  return request.get(`${baseUrl}/virtualswitch`, {
    params: params
  })
}

export function getSystemrole(params) {
  return request.get(`${baseUrl}/systemrole`, {
    params: params
  })
}

export function getVpnipsecconfig(params) {
  return request.get(`${baseUrl}/vpnipsecconfig`, {
    params: params
  })
}

export function getVpnipsecpeer(params) {
  return request.get(`${baseUrl}/vpnipsecpeer`, {
    params: params
  })
}

export function getVpnIpsecProposal1(params) {
  return request.get(`${baseUrl}/vpnipsecproposal1`, {
    params: params
  })
}

export function getVpnIpsecProposal2(params) {
  return request.get(`${baseUrl}/vpnipsecproposal2`, {
    params: params
  })
}

export function getVirtualrouterip(params) {
  return request.get(`${baseUrl}/virtualrouterip`, {
    params: params
  })
}

// 安全策略
export function getSecuritypolicy(params) {
  return request.get(`${baseUrl}/securitypolicy`, {
    params: params
  })
}
export function createSecuritypolicy(params) {
  return request.post(`${baseUrl}/securitypolicy`, wrapperParams(params))
}
export function removeSecuritypolicy(id) {
  return request.delete(`${baseUrl}/securitypolicy/${id}`)
}
export function moveSecuritypolicy(id, params) {
  return request.patch(`${baseUrl}/securitypolicy/move/${id}`, wrapperParams(params))
}
// 服务
export function getServicebook(params) {
  return request.get(`${baseUrl}/servicebook`, {
    params: params
  })
}
export function createServicebook(params) {
  return request.post(`${baseUrl}/servicebook`, wrapperParams(params))
}
export function removeServicebook(id) {
  return request.delete(`${baseUrl}/servicebook/${id}`)
}
// 服务组
export function getServicegroup(params) {
  return request.get(`${baseUrl}/servicegroup`, {
    params: params
  })
}
export function createServicegroup(params) {
  return request.post(`${baseUrl}/serviceGroup`, wrapperParams(params))
}
export function removeServicegroup(id) {
  return request.delete(`${baseUrl}/serviceGroup/${id}`)
}
// 安全域
export function getSafezone(params) {
  return request.get(`${baseUrl}/safezone`, {
    params: params
  })
}
export function createSafezone(params) {
  return request.post(`${baseUrl}/safezone`, wrapperParams(params))
}
export function removeSafezone(id) {
  return request.delete(`${baseUrl}/safezone/${id}`)
}
// 管理员
export function getSystemuser(params) {
  return request.get(`${baseUrl}/systemuser`, {
    params: params
  })
}
export function createSystemuser(params) {
  return request.post(`${baseUrl}/systemuser`, wrapperParams(params))
}
export function modifySystemuser(params) {
  return request.put(`${baseUrl}/systemuser/${params.id}`, wrapperParams(params))
}
export function removeSystemuser(id) {
  return request.delete(`${baseUrl}/systemuser/${id}`)
}
// 黑名单IP阻断
export function getBlackIp(params) {
  return request.get(`${baseUrl}/blackip`, {
    params: params
  })
}
export function createBlackIp(params) {
  return request.post(`${baseUrl}/blackip`, wrapperParams(params))
}
export function removeBlackIp(id) {
  return request.delete(`${baseUrl}/blackip/${id}`)
}
// 黑名单服务阻断
export function getBlackService(params) {
  return request.get(`${baseUrl}/blackservice`, {
    params: params
  })
}
export function createBlackService(params) {
  return request.post(`${baseUrl}/blackservice`, wrapperParams(params))
}
export function removeBlackService(id) {
  return request.delete(`${baseUrl}/blackservice/${id}`)
}
// SNMP主机
export function getSnmphost(params) {
  return request.get(`${baseUrl}/snmphost`, {
    params: params
  })
}
export function createSnmphost(params) {
  return request.post(`${baseUrl}/snmphost`, wrapperParams(params))
}
// SNMPV3用户
export function getSnmpv3user(params) {
  return request.get(`${baseUrl}/snmpv3user`, {
    params: params
  })
}
export function createSnmpv3user(params) {
  return request.post(`${baseUrl}/snmpv3user`, wrapperParams(params))
}
// SNMPV3用户组
export function getSnmpv3group(params) {
  return request.get(`${baseUrl}/snmpv3group`, {
    params: params
  })
}
export function createSnmpv3group(params) {
  return request.post(`${baseUrl}/snmpv3group`, wrapperParams(params))
}
// SNMP代理
export function getSnmpproxy(params) {
  return request.get(`${baseUrl}/snmpproxy`, {
    params: params
  })
}
export function createSnmpproxy(params) {
  return request.post(`${baseUrl}/snmpproxy`, wrapperParams(params))
}
// 地址簿
export function getAddressbook(params) {
  return request.get(`${baseUrl}/addressbook`, {
    params: params
  })
}
export function createAddressbook(params) {
  return request.post(`${baseUrl}/addressbook`, wrapperParams(params))
}
export function removeAddressbook(id) {
  return request.delete(`${baseUrl}/addressbook/${id}`)
}
// 系统配置
export function getSystemconfig(params) {
  return request.get(`${baseUrl}/systemconfig`, {
    params: params
  })
}
export function getNetwork(params) {
  return request.get(`${baseUrl}/systemconfig/networkparameters`, {
    params: params
  })
}
export function getGateway(params) {
  return request.get(`${baseUrl}/systemconfig/alg`, {
    params: params
  })
}
// 路由
export function getVirtualrouteribv4(params) {
  return request.get(`${baseUrl}/virtualrouteribv4`, {
    params: params
  })
}
export function createRoutes(params) {
  return request.post(`${baseUrl}/routes`, wrapperParams(params))
}
export function removeRoutes(id) {
  return request.delete(`${baseUrl}/routes/${id}`)
}
// 策略路由
export function getPolicyroute(params) {
  return request.get(`${baseUrl}/policyroute`, {
    params: params
  })
}
export function createPolicyroute(params) {
  return request.post(`${baseUrl}/policyroute`, wrapperParams(params))
}
export function removePolicyroute(id) {
  return request.delete(`${baseUrl}/policyroute/${id}`)
}
// 源NAT
export function getVirtualroutesourcenat(params) {
  return request.get(`${baseUrl}/virtualroutesourcenat`, {
    params: params
  })
}
export function createSourcenat(params) {
  return request.post(`${baseUrl}/sourcenat`, wrapperParams(params))
}
export function removeSourcenat(id) {
  return request.delete(`${baseUrl}/sourcenat/${id}`)
}
// 目的NAT
export function getVirtualroutedestinationnat(params) {
  return request.get(`${baseUrl}/virtualroutedestinationnat`, {
    params: params
  })
}
export function createDestinationnat(params) {
  return request.post(`${baseUrl}/destinationnat`, wrapperParams(params))
}
export function removeDestinationnat(id) {
  return request.delete(`${baseUrl}/destinationnat/${id}`)
}
// 接口
export function getInterface(params) {
  return request.get(`${baseUrl}/interface`, {
    params: params
  })
}
export function createInterface(params) {
  return request.post(`${baseUrl}/interface`, wrapperParams(params))
}
export function modifyInterface(params) {
  return request.put(`${baseUrl}/interface/${params.id}`, wrapperParams(params))
}
export function removeInterface(id) {
  return request.delete(`${baseUrl}/interface/${id}`)
}
