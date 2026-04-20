import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'
export function delCabinetTableRows(params) {
  return request.delete(`/nms/v1/agile/cabinets/${params.id}`)
}
export function getCabinetDevicePhysical(params) {
  return request.get('/nms/v1/agile/device', { params })
}
// action修改
export function getCabinetDevicePhysicalByCabinet(params) {
  return request.get('/nms/v1/agile/device/cabinet', { params })
}

export function getCabinetGroupPhysical(params) {
  return request.get('/nms/v1/agile/cabinets/group', { params })
}
export function getAreaExportResources(params) {
  return request.get('/nms/v1/agile/vpcs/export', { params })
}
export function getIpPoolExportResources(params) {
  return request.get('/nms/v1/agile/logic/switches/export ', { params })
}
export function getIpExportResources(params) {
  return request.get('/nms/v1/agile/ip/export', { params })
}
export function getAreaBindResources(params, obj) {
  return request.get(`/nms/v1/agile/vpcs/${obj.id}/business`, { params })
}
// action修改
export function getAreaBindResourcesByUnbind(params, obj) {
  return request.get(`/nms/v1/agile/vpcs/${obj.id}/business/unbind`, { params })
}
export function getIpBindResources(params, obj) {
  return request.get(`/nms/v1/agile/logic/switches/${obj.id}/pools`, { params })
}
export function getBindIlo(params) {
  return request.get('/nms/v1/agile/cabinets/ilo/no/pool', { params })
}
export function getFixBindIlo(params) {
  return request.put(`/nms/v1/agile/ilo/pools/${params.id}`, params.obj)
}
// action修改
export function getFixBindIloByBind(params) {
  return request.put(`/nms/v1/agile/ilo/pools/${params.id}/bind`, params.obj)
}
export function getIpPoolIlo(params) {
  return request.get('/nms/v1/agile/ilo/pools', { params })
}
export function getAddressIlo(params) {
  return request.get('/nms/v1/agile/ilo/ips', { params })
}
export function addIpPoolIlo(params) {
  return request.post('/nms/v1/agile/ilo/pools', wrapperParams(params))
}
export function getIpPoolResources(params) {
  return request.get('/nms/v1/agile/logic/switches/pools', { params })
}
export function postCabinetsPhysical(params) {
  return request.post('/nms/v1/agile/cabinets', params)
}
export function postIpPoolResources(params) {
  return request.put(`/nms/v1/agile/logic/switches/${params.id}/pools`, params.obj)
}
export function postAreaResources(params) {
  return request.put(`/nms/v1/agile/vpcs/${params.id}/business`, params.obj)
}
// action修改
export function postAreaResourcesByBind(params) {
  return request.put(`/nms/v1/agile/vpcs/${params.id}/business/bind`, params.obj)
}
export function getIpResources(params) {
  return request.get('/nms/v1/agile/ip', { params })
}
export function getAreaIpInfo(params) {
  return request.get('/nms/v1/agile/ip/achieve', { params })
}
export function getAreaResourcesHosts(params) {
  return request.get('/nms/v1/agile/vpcs/business/hosts', { params })
}
export function getAreaResources(params) {
  return request.get('/nms/v1/agile/vpcs/business', { params })
}
export function getAreaCabinets(params) {
  return request.get('/nms/v1/agile/cabinets', { params })
}
export function postPortsGetIpInfo(params) {
  return request.post('/nms/v1/agile/ip/fails', { params })
}
export function closePortsUnassign(params) {
  return request.post('/nms/v1/agile/device/port/unassign', { params })
}
export function delPortsTableRows(params) {
  return request.delete(`/nms/v1/agile/logic/ports/business/${params.id}`)
}
export function getPortsTableExport(params) {
  return request.get('/nms/v1/agile/logic/ports/export', { params })
}
export function getPortsPhysical(params) {
  return request.get('/nms/v1/agile/device/ports', { params })
}
// action修改
export function getPortsPhysicalByBusiness(params) {
  return request.get('/nms/v1/agile/device/ports/business', { params })
}
export function getAreaIpInfoAssign(params) {
  return request.get('/nms/v1/agile/device/port/assign', { params })
}
// 修改
export function getIpAchieve(params) {
  return request.get('/nms/v1/agile/ip/achieve', { params })
}
export function postPortsPhysical(params) {
  return request.post('/nms/v1/agile/logic/ports/business', { params })
}
export function getNetworkEquipment(params) {
  return request.get('/nms/v1/agile/device', { params })
}
export function getTakeawayPhysical(params) {
  return request.get('/nms/v1/agile/ilo', { params })
}
export function getDevicePhysical(params) {
  return request.get('/nms/v1/agile/device', { params })
}
// action修改
export function getBusinessDevice(params) {
  return request.get('/nms/v1/agile/device/business', { params })
}
export function getNetworkEquipmentByBusiness(params) {
  return request.get('/nms/v1/agile/device/business', { params })
}

export function getCabinet(params) {
  return request.get('/nms/v1/agile/cabinets', { params })
}
export function getVendorNums(id) {
  return request.get(`/nms/v1/agile/views/vendor/nums/${id}`)
}
export function getVendorStatus(id, params) {
  return request.get(`/nms/v1/agile/views/vendor/status/${id}`, { params })
}
// action修改
export function getVendorStatusByType(id, type, params) {
  return request.get(`/nms/v1/agile/views/vendor/status/${id}/${type}`, { params })
}
export function getTenant(params) {
  return request.get('/nms/v1/agile/tenants', { params })
}
export function getTenantStatus(id, params) {
  return request.get(`/nms/v1/agile/views/tenant/status/${id}`, { params })
}
// action修改
export function getTenantStatusByType(id, type, params) {
  return request.get(`/nms/v1/agile/views/tenant/status/${id}/${type}`, { params })
}
export function getTenantDetail(id) {
  return request.get(`/nms/v1/agile/tenants/${id}`)
}
export function createTenant(params) {
  return request.post('/nms/v1/agile/tenants', wrapperParams(params))
}
export function modifyTenant(params) {
  return request.post(`/nms/v1/agile/tenants/${params.id}`, wrapperParams(params))
}
export function deleteTenant(id) {
  return request.delete(`/nms/v1/agile/tenants/${id}`)
}
export function getSwitch(params) {
  return request.get('/nms/v1/agile/logic/switches', { params })
}
export function getSwitchDetail(id) {
  return request.get(`/nms/v1/agile/logic/switches/${id}`)
}
export function deleteSwitch(id) {
  return request.delete(`/nms/v1/agile/logic/switches/${id}`)
}
export function getVpc(params) {
  return request.get('/nms/v1/agile/vpcs', { params })
}
export function getVpcDetail(id) {
  return request.get(`/nms/v1/agile/vpcs/${id}`)
}
export function createVpc(params) {
  return request.post('/nms/v1/agile/vpcs', wrapperParams(params))
}
export function modifyVpc(params) {
  return request.post(`/nms/v1/agile/vpcs/${params.id}`, wrapperParams(params))
}
export function deleteVpc(id) {
  return request.delete(`/nms/v1/agile/vpcs/${id}`)
}
export function createSwitch(params) {
  return request.post('/nms/v1/agile/logic/switches', wrapperParams(params))
}
export function modifySwitch(params) {
  return request.post(`/nms/v1/agile/logic/switches/${params.id}`, wrapperParams(params))
}
export function getFabrics(params) {
  return request.get('/nms/v1/agile/fabrics', { params })
}
export function getFabricsDetail(id) {
  return request.get(`/nms/v1/agile/fabrics/${id}`)
}
export function getDeviceGroups(params) {
  return request.get('/nms/v1/agile/device/groups', { params })
}
// 创建逻辑端口获取fabric修改
export function getDeviceGroupsFabric(params) {
  return request.get('/nms/v1/agile/device/groups/fabricpool', { params })
}
export function getDevicePorts(params) {
  return request.get('/nms/v1/agile/device/ports', { params })
}
export function getDevices(params) {
  return request.get('/nms/v1/agile/device', { params })
}
export function getLogicPorts(params) {
  return request.get('/nms/v1/agile/logic/ports', { params })
}
// action修改
export function getLogicPortsByUnuse(params) {
  return request.get('/nms/v1/agile/logic/ports/unuse', { params })
}
export function getLogicPortsByBusiness(params) {
  return request.get('/nms/v1/agile/logic/ports/business', { params })
}
export function createLogicPorts(params) {
  return request.post('/nms/v1/agile/logic/ports', wrapperParams(params))
}
export function modifyLogicPorts(params) {
  return request.post(`/nms/v1/agile/logic/ports/${params.id}`, wrapperParams(params))
}
export function deleteLogicPort(id) {
  return request.delete(`/nms/v1/agile/logic/ports/${id}`)
}
export function getLogicPortDetail(id) {
  return request.get(`/nms/v1/agile/logic/ports/${id}`)
}
export function getEndPorts(params) {
  return request.get('/nms/v1/agile/end/ports', { params })
}
export function createEndPorts(params) {
  return request.post('/nms/v1/agile/end/ports', wrapperParams(params))
}
export function modifyEndPorts(params) {
  return request.post(`/nms/v1/agile/end/ports/${params.id}`, wrapperParams(params))
}
export function deleteEndPort(id) {
  return request.delete(`/nms/v1/agile/end/ports/${id}`)
}
export function getEndPortDetail(id) {
  return request.get(`/nms/v1/agile/end/ports/${id}`)
}
export function getRouters(params) {
  return request.get('/nms/v1/agile/logic/routers', { params })
}
export function getRoutersDetail(id) {
  return request.get(`/nms/v1/agile/logic/routers/${id}`)
}
export function createRouters(params) {
  return request.post('/nms/v1/agile/logic/routers', wrapperParams(params))
}
export function modifyRouters(params) {
  return request.post(`/nms/v1/agile/logic/routers/${params.id}`, wrapperParams(params))
}
export function deleteRouters(id) {
  return request.delete(`/nms/v1/agile/logic/routers/${id}`)
}
export function getStatisRouters(id, params) {
  return request.get(`/nms/v1/agile/logic/routers/${id}/statis/router`, { params })
}
export function getSubnets(params) {
  return request.get('/nms/v1/agile/subnets', { params })
}
export function createSubnet(params) {
  return request.post('/nms/v1/agile/subnets', wrapperParams(params))
}
export function modifySubnet(params) {
  return request.post(`/nms/v1/agile/subnets/${params.id}`, wrapperParams(params))
}
export function deleteSubnet(id) {
  return request.delete(`/nms/v1/agile/subnets/${id}`)
}
export function getVass(params) {
  return request.get('/nms/v1/agile/vass', { params })
}
export function getVassDetail(id) {
  return request.get(`/nms/v1/agile/vass/${id}`)
}
export function createVas(params) {
  return request.post('/nms/v1/agile/vass', wrapperParams(params))
}
export function modifyVas(params) {
  return request.post(`/nms/v1/agile/vass/${params.id}`, wrapperParams(params))
}
export function deleteVas(id) {
  return request.delete(`/nms/v1/agile/vass/${id}`)
}
export function getVasPorts(params) {
  return request.get('/nms/v1/agile/vasports', { params })
}
export function getExternalgateways(params) {
  return request.get('/nms/v1/agile/externalgateways', { params })
}
export function getExternalgatewaysDetail(id) {
  return request.get(`/nms/v1/agile/externalgateways/${id}`)
}
export function getExternalNetworks(params) {
  return request.get('/nms/v1/agile/external/networks', { params })
}
export function getDhcpgroups(params) {
  return request.get('/nms/v1/agile/dhcpgroups', { params })
}
export function getDhcpgroupsDetail(id) {
  return request.get(`/nms/v1/agile/dhcpgroups/${id}`)
}
export function exportIlo(params) {
  downloadFile('/nms/v1/agile/ilo/export', params)
}
export function exportIloIps(params) {
  downloadFile('/nms/v1/agile/ilo/ips/export', params)
}
export function exportIloPools(params) {
  downloadFile('/nms/v1/agile/ilo/pools/export', params)
}
export function exportIp(params) {
  downloadFile('/nms/v1/agile/ip/export', params)
}
export function exportLogicSwitch(params) {
  downloadFile('/nms/v1/agile/logic/switches/export', params)
}
export function exportVpcs(params) {
  downloadFile('/nms/v1/agile/vpcs/export', params)
}
export function exportDevicePort(params) {
  downloadFile('/nms/v1/agile/device/port/export', params)
}
export function exportLogicPort(params) {
  downloadFile('/nms/v1/agile/logic/ports/export', params)
}
// 华三SDN
const baseUrl = '/nms/v1/campus'
// 设备
export function getCampusDevice(params) {
  return request.get(`${baseUrl}/device`, { params })
}
export function createCampusDevice(params) {
  return request.post(`${baseUrl}/device`, wrapperParams(params))
}
export function operateCampusDevice(id, action, params) {
  return request.patch(`${baseUrl}/device/${id}`, {
    action,
    ...wrapperParams(params)
  })
}
// 设备接口
export function getsDeviceInterface(params) {
  return request.get(`${baseUrl}/deviceinterface`, { params })
}
export function operateDeviceInterface(id, action, params) {
  return request.patch(`${baseUrl}/deviceinterface/${id}`, {
    action,
    ...wrapperParams(params)
  })
}
// 访客管理员
export function getGuestAdmin(params) {
  return request.get(`${baseUrl}/guestadmin`, { params })
}
// 访客列表
export function getGuestUser(params) {
  return request.get(`${baseUrl}/guestuser`, { params })
}
// 访客服务列表
export function getGuestService(params) {
  return request.get(`${baseUrl}/guestservice`, { params })
}
// 在线用户列表
export function getOnlineUser(params) {
  return request.get(`${baseUrl}/onlineuser`, { params })
}
// 接入用户列表
export function getAccessUser(params) {
  return request.get(`${baseUrl}/acmuser`, { params })
}
// 安全组
export function getSafeGroup(params) {
  return request.get(`${baseUrl}/secgroup`, { params })
}
// 二层安全域
export function getSafeZone(params) {
  return request.get(`${baseUrl}/domain`, { params })
}
// IP地址段
export function getIpAddress(params) {
  return request.get(`${baseUrl}/assignedipscope`, { params })
}
