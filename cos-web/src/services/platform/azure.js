import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getMonitor(params) {
  return request.post('/ims/v1/azure/monitors/metrics', wrapperParams(params))
}

export function getMonitorName(params) {
  return request.post('/ims/v1/azure/monitors/metric/namespaces', wrapperParams(params))
}

const resourceUrl = '/ims/v1/resource/groups'
export function getResource(params) {
  return request.get(resourceUrl, {
    params: params
  })
}

export function putRedisSet(params) {
  return request.put(`${redisUrl}/${params.id}/pricing/layers`, wrapperParams(params))
}

export function removeVnet(id) {
  return request.delete(`${vnetUrl}/${id}`)
}

export function getMysqlStoragePirce(params) {
  return request.get(`${priceUrl}/mysql/storages`, {
    params: wrapperParams(params)
  })
}

export function putMysqlSet(params) {
  return request.put(`${mysqlUrl}/${params.id}/pricing/layers`, wrapperParams(params))
}

const vnetUrl = '/ims/v1/cloud/database/server/vnet/rules'
export function getVnet(params) {
  return request.get(vnetUrl, {
    params: params
  })
}

export function createVnet(params) {
  return request.post(vnetUrl, wrapperParams(params))
}

// 标签功能
export function putTags(params) {
  return request.put('/ims/v1/tags', wrapperParams(params))
}

export function release(params) {
  return request.put(`/ims/v1/resource/lock/${params.id}/release`, { type: params.type })
}

export function lock(params) {
  return request.put(`/ims/v1/resource/lock/${params.id}/lock`, { type: params.type })
}

export function createResource(params) {
  return request.post(resourceUrl, wrapperParams(params))
}

export function detailResource(id) {
  return request.get(`${resourceUrl}/${id}`)
}

export function removeResource(id) {
  return request.delete(`${resourceUrl}/${id}`)
}

// nic
const nicsUrl = '/ims/v1/azure/nics'
export function getNics(params) {
  return request.get(nicsUrl, { params })
}

export function createNics(params) {
  return request.post(nicsUrl, wrapperParams(params))
}

export function addNics(params) {
  return request.post(`${nicsUrl}/${params.id}/privateIp`, params)
}

export function createVmNics(params) {
  return request.post(`${nicsUrl}/cbs`, wrapperParams(params))
}

export function getNicsList(params) {
  return request.get(`${nicsUrl}/list`, { params })
}

export function modifyNics(params) {
  return request.put(`${nicsUrl}/${params.id}`, wrapperParams(params))
}

export function removeNics(id) {
  return request.delete(`${nicsUrl}/${id}`)
}

export function detailNics(id) {
  return request.get(`${nicsUrl}/${id}`)
}

export function modifyNicsSubnet(params) {
  return request.put(`${nicsUrl}/${params.id}/subnets`, wrapperParams(params))
}

export function patchNics(action, params) {
  return request.patch(`${nicsUrl}/${params.id}`, { action: action, ...wrapperParams(params) })
}

export function nicsGroups(params) {
  return request.post(`${nicsUrl}/${params.id}/sgroups`, wrapperParams(params))
}

export function getNicsIp(params) {
  return request.get(`${nicsUrl}/ips`, { params })
}

export function createNicsIp(params) {
  return request.post(`${nicsUrl}/ips`, wrapperParams(params))
}

export function removeNicsIp(id) {
  return request.delete(`${nicsUrl}/ips/${id}`)
}

export function patchNicsIp(action, params) {
  return request.patch(`${nicsUrl}/ips/${params.id}`, { action: action, ...wrapperParams(params) })
}

const availabilitiesSetUrl = '/ims/v1/availabilities/sets'
export function getSet(params) {
  return request.get(availabilitiesSetUrl, {
    params: params
  })
}

export function createSet(params) {
  return request.post(availabilitiesSetUrl, wrapperParams(params))
}

export function detailSet(id) {
  return request.get(`${availabilitiesSetUrl}/${id}`)
}

export function removeSet(id) {
  return request.delete(`${availabilitiesSetUrl}/${id}`)
}

const publicIpsUrl = '/ims/v1/publicIps/addresses'
export function getPublicIps(params) {
  return request.get(publicIpsUrl, {
    params: params
  })
}

export function createPublicIps(params) {
  return request.post(publicIpsUrl, wrapperParams(params))
}

export function detailPublicIps(id) {
  return request.get(`${publicIpsUrl}/${id}`)
}

export function removePublicIps(id) {
  return request.delete(`${publicIpsUrl}/${id}`)
}

export function removePublicIpss(params) {
  return request.delete(`${publicIpsUrl}`, { params: wrapperParams(params) })
}

export function getPublicIpsUnused(params) {
  return request.get(`${publicIpsUrl}/unused`, {
    params: wrapperParams(params)
  })
}
export function getPublicIpsUnused2(params) {
  return request.get(`${publicIpsUrl}/unused`, { params })
}

const lbUrl = '/ims/v1/slbs'
export function getLb(params) {
  return request.get(lbUrl, {
    params: params
  })
}

export function createLb(params) {
  return request.post(lbUrl, wrapperParams(params))
}

export function detailLb(id) {
  return request.get(`${lbUrl}/${id}`)
}

export function removeLb(id) {
  return request.delete(`${lbUrl}/${id}`)
}
export function lbUsers(params) {
  return request.post(`${lbUrl}/${params.id}/users`, wrapperParams(params))
}
const frontendsUrl = '/ims/v1/frontends'
export function getFrontends(params) {
  return request.get(frontendsUrl, {
    params: params
  })
}
export function createFrontends(params) {
  return request.post(frontendsUrl, wrapperParams(params))
}
export function createFrontend(params) {
  return request.post(`${frontendsUrl}/creates`, wrapperParams(params))
}
export function removeFrontends(id) {
  return request.delete(`${frontendsUrl}/${id}`)
}
export function removFrontend(params) {
  return request.delete(`${frontendsUrl}`, { params: wrapperParams(params) })
}

const backendsUrl = '/ims/v1/backends'
export function getBackends(params) {
  return request.get(backendsUrl, {
    params: params
  })
}
export function createBackends(params) {
  return request.post(backendsUrl, wrapperParams(params))
}
export function removeBackends(id) {
  return request.delete(`${backendsUrl}/${id}`)
}
const probesUrl = '/ims/v1/probes'
export function getProbes(params) {
  return request.get(probesUrl, {
    params: params
  })
}
export function createProbes(params) {
  return request.post(probesUrl, wrapperParams(params))
}
export function removeProbes(id) {
  return request.delete(`${probesUrl}/${id}`)
}
const lbsRulesUrl = '/ims/v1/lbs/rules'
export function getLbRules(params) {
  return request.get(lbsRulesUrl, {
    params: params
  })
}
export function createLbRules(params) {
  return request.post(lbsRulesUrl, wrapperParams(params))
}
export function removeLbRules(id) {
  return request.delete(`${lbsRulesUrl}/${id}`)
}
const natRulesUrl = '/ims/v1/nats/rules'
export function getNatRules(params) {
  return request.get(natRulesUrl, {
    params: params
  })
}
export function createNatRules(params) {
  return request.post(natRulesUrl, wrapperParams(params))
}
export function removeNatRules(id) {
  return request.delete(`${natRulesUrl}/${id}`)
}

const monitorRulesUrl = '/ims/v1/azure/metric/alerts'
export function getMonitorAlert(params) {
  return request.get(monitorRulesUrl, {
    params: params
  })
}
export function createMonitorAlert(params) {
  return request.post(`${monitorRulesUrl}/batch`, wrapperParams(params))
}
export function modifyMonitorAlert(params) {
  return request.put(`${monitorRulesUrl}/${params.metricAlert.id}`, wrapperParams(params))
}

export function removeMonitorAlert(id) {
  return request.delete(`${monitorRulesUrl}/${id}`)
}

export function detailMonitorAlert(id) {
  return request.get(`${monitorRulesUrl}/${id}`)
}

export function getMonitorDefinitions(params) {
  return request.post('/ims/v1/azure/monitors/metric/definitions', wrapperParams(params))
}

const skuUrl = '/ims/v1/cloud/database/skus'
export function getSku(params) {
  return request.get(skuUrl, {
    params: params
  })
}

export function getSkuDetail(id) {
  return request.get(`${skuUrl}/${id}`)
}

const mysqlUrl = '/ims/v1/cloud/database/servers'
export function getMysql(params) {
  return request.get(mysqlUrl, {
    params: params
  })
}
export function createMysql(params) {
  return request.post(mysqlUrl, wrapperParams(params))
}
export function modifyMysql(params) {
  return request.put(`${mysqlUrl}/${params.id}`, wrapperParams(params))
}

export function removeMysql(id) {
  return request.delete(`${mysqlUrl}/${id}`)
}

export function removeMysqls(params) {
  return request.delete(`${mysqlUrl}`, { params: wrapperParams(params) })
}

export function detailMysql(id) {
  return request.get(`${mysqlUrl}/${id}`)
}

export function putMysql(action, params) {
  return request.patch(`${mysqlUrl}/${params.id}`, { action: action, ...wrapperParams(params) })
}

const redisUrl = '/ims/v1/cloud/redis'
export function getRedis(params) {
  return request.get(redisUrl, {
    params: params
  })
}
export function createRedis(params) {
  return request.post(redisUrl, wrapperParams(params))
}
export function modifyRedis(params) {
  return request.put(`${redisUrl}/${params.id}`, wrapperParams(params))
}

export function removeRedis(id) {
  return request.delete(`${redisUrl}/${id}`)
}

export function removeRediss(params) {
  return request.delete(`${redisUrl}`, { params: wrapperParams(params) })
}

export function detailRedis(id) {
  return request.get(`${redisUrl}/${id}`)
}

export function putRedis(action, params) {
  return request.put(`${redisUrl}/${params.id}`, { condition: JSON.stringify({ action: action }), ...wrapperParams(params) })
}
export function patchRedis(action, params) {
  return request.patch(`${mysqlUrl}/${params.id}`, { action: action, ...wrapperParams(params) })
}
export function settingRedis(params) {
  return request.put(`${redisUrl}/${params.redis.id}`, { ...wrapperParams(params) })
}

const containersUrl = '/ims/v1/azure/containers'
export function getContainers(params) {
  return request.get(containersUrl, {
    params: params
  })
}
export function createContainers(params) {
  return request.post(containersUrl, wrapperParams(params))
}
export function modifyContainers(params) {
  return request.put(`${containersUrl}/${params.id}`, wrapperParams(params))
}

export function removeContainers(id) {
  return request.delete(`${containersUrl}/${id}`)
}

export function detailContainers(id) {
  return request.get(`${containersUrl}/${id}`)
}

export function removeContainerss(params) {
  return request.delete(`${containersUrl}`, { params: wrapperParams(params) })
}

export function putMeta(id, params) {
  return request.put(`${containersUrl}/${id}/metadata`, wrapperParams(params))
}

export function patchContainers(params) {
  return request.patch(`${containersUrl}/${params.id}`, { action: 'updatePublicAccessType', ...wrapperParams(params) })
}

const accountUrl = '/ims/v1/storage/accounts'
export function getAccount(params) {
  return request.get(accountUrl, {
    params: params
  })
}

export function createAccount(params) {
  return request.post(accountUrl, wrapperParams(params))
}
export function modifyAccount(params) {
  return request.put(`${accountUrl}/${params.id}`, wrapperParams(params))
}

export function removeAccount(id) {
  return request.delete(`${accountUrl}/${id}`)
}

export function detailAccount(id) {
  return request.get(`${accountUrl}/${id}`)
}

const ruleUrl = '/ims/v1/cloud/database/server/firewall/rules'
export function getRule(params) {
  return request.get(ruleUrl, {
    params: params
  })
}
export function createRule(params) {
  return request.post(ruleUrl, wrapperParams(params))
}

export function removeRule(id) {
  return request.delete(`${ruleUrl}/${id}`)
}

const redisRuleUrl = '/ims/v1/cloud/redis/firewall/rules'
export function getRedisRule(params) {
  return request.get(redisRuleUrl, {
    params: params
  })
}
export function createRedisRule(params) {
  return request.post(redisRuleUrl, wrapperParams(params))
}

export function removeRedisRule(id) {
  return request.delete(`${redisRuleUrl}/${id}`)
}

const databasesUrl = '/ims/v1/cloud/database/server/databases'
export function getDatabase(params) {
  return request.get(databasesUrl, {
    params: params
  })
}
export function createDatabase(params) {
  return request.post(databasesUrl, wrapperParams(params))
}

export function removeDatabase(id) {
  return request.delete(`${databasesUrl}/${id}`)
}

export function getLogs(id) {
  return request.get(`/ims/v1/cloud/database/server/logs/dbs/${id}`)
}

export function getConnects(id) {
  return request.get(`/ims/v1/cloud/database/server/connects/${id}`)
}

const configurationsUrl = '/ims/v1/cloud/database/server/configurations'
export function getConfigurations(params) {
  return request.get(configurationsUrl, {
    params: params
  })
}

export function putConfigurations(id, params) {
  return request.put(`${configurationsUrl}/${id}`, wrapperParams(params))
}

const blobUrl = '/ims/v1/azure/blobs'
export function getBlob(params) {
  return request.get(blobUrl, {
    params: params
  })
}
export function createBlob(params) {
  return request.post(blobUrl, params)
}
export function modifyBlob(params) {
  return request.put(`${blobUrl}/${params.id}`, wrapperParams(params))
}

export function removeBlob(id) {
  return request.delete(`${blobUrl}/${id}`)
}

export function detailBlob(id) {
  return request.get(`${blobUrl}/${id}`)
}

export function removeBlobs(params) {
  return request.delete(`${blobUrl}`, { params: wrapperParams(params) })
}

export function downloadBlob(id) {
  return request.get(`${blobUrl}/${id}/download`)
}

export function removeBlobSnpshot(id) {
  return request.delete(`${blobUrl}/snapshots/${id}`)
}

export function getRedisPirce(params) {
  return request.get(`${priceUrl}/redis`, {
    params: wrapperParams(params)
  })
}
export function addAccountFirewallIp(params) {
  return request.post(`${accountUrl}/${params.storageAccountId}/with/access/ip/address`, wrapperParams(params))
}
export function addAccountNetwork(params) {
  return request.post(`${accountUrl}/${params.id}/with/access/subnet`, wrapperParams(params))
}
export function getAccountPirce(params) {
  return request.get(`${priceUrl}/storage/accounts`, {
    params: wrapperParams(params)
  })
}
export function postAccountAllNetwork(params) {
  return request.post(`${accountUrl}/${params.id}/with/access/all/network`, wrapperParams(params))
}
export function postAccountKey(params) {
  return request.post(`${accountUrl}/${params.id}/regenerate/keys`, wrapperParams(params))
}
export function putAccountDomain(params) {
  return request.put(`${accountUrl}/${params.id}/custom/domain`, wrapperParams(params))
}
export function putAccountTls(params) {
  return request.put(`${accountUrl}/${params.id}/tls`, wrapperParams(params))
}
export function removeAccountFirewallIp(params) {
  return request.post(`${accountUrl}/${params.id}/with/out/ip/address`, wrapperParams(params))
}
export function removeAccountNetwork(params) {
  return request.post(`${accountUrl}/${params.id}/without/access/subnet`, wrapperParams(params))
}
export function createNicsDns(id, params) {
  return request.put(`${nicsUrl}/${id}/add/dns/servers`, wrapperParams(params))
}
export function getBackendsCreateVms(id, params) {
  return request.get(`${backendsUrl}/${id}/create/vms`, {
    params: params
  })
}
export function getBackendsVms(id, params) {
  return request.get(`${backendsUrl}/${id}/vms`, {
    params: params
  })
}
export function modifyBackends(id, params) {
  return request.put(`${backendsUrl}/${id}`, wrapperParams(params))
}
export function modifyLbRules(id, params) {
  return request.put(`${lbsRulesUrl}/${id}`, wrapperParams(params))
}
export function modifyNicsIp(params) {
  return request.put(`${nicsUrl}/ips/${params.id}`, wrapperParams(params))
}
export function modifyProbes(id, params) {
  return request.put(`${probesUrl}/${id}`, wrapperParams(params))
}
export function putNicsIpForward(params) {
  return request.put(`${nicsUrl}/${params.id}/ip/forwarding`, wrapperParams(params))
}
export function removeNicsDns(id, params) {
  return request.put(`${nicsUrl}/${id}/remove/dns/servers`, wrapperParams(params))
}

export function createBlobSnpshot(params) {
  return request.post(`${blobUrl}/snapshots`, wrapperParams(params))
}

export function downloadBlobSnapshot(id) {
  return request.get(`${blobUrl}/${id}/snapshots/download`)
}

export function patchBolbTier(params) {
  return request.patch(`${blobUrl}/${params.id}`, { action: 'uploadStandardBlobTier', ...wrapperParams(params) })
}

const priceUrl = '/ims/v1/azure/prices'
export function getPirce(params) {
  return request.get(priceUrl, {
    params: params
  })
}
export function getMysqlVcouePirce(params) {
  return request.get(`${priceUrl}/mysql/vcores`, {
    params: wrapperParams(params)
  })
}
export function createPirce(params) {
  return request.post(priceUrl, wrapperParams(params))
}
export function modifyPirce(params) {
  return request.put(`${priceUrl}/${params.id}`, wrapperParams(params))
}

export function removePirce(id) {
  return request.delete(`${priceUrl}/${id}`)
}

export function detailPirce(id) {
  return request.get(`${priceUrl}/${id}`)
}

export function removePirces(params) {
  return request.post(`${priceUrl}/batch/remove`, wrapperParams(params))
}

const ddosUrl = '/ims/v1/azure/ddos'
export function getDdos(params) {
  return request.get(ddosUrl, {
    params: params
  })
}
export function createDdos(params) {
  return request.post(ddosUrl, wrapperParams(params))
}
export function modifyDdos(id, params) {
  return request.put(`${ddosUrl}/${id}`, wrapperParams(params))
}

export function removeDdos(id) {
  return request.delete(`${ddosUrl}/${id}`)
}

export function detailDdos(id) {
  return request.get(`${ddosUrl}/${id}`)
}

export function removeDdoss(params) {
  return request.post(`${ddosUrl}/batch/remove`, wrapperParams(params))
}

export function chcekName(params) {
  return request.post('/ims/v1/resource/check/names', wrapperParams(params))
}

export function chcekStorageName(params) {
  return request.post('/ims/v1/storage/accounts/check/names', wrapperParams(params))
}

export function getVolumePirce(params) {
  return request.get(`${priceUrl}/volumes`, {
    params: wrapperParams(params)
  })
}
export function postVolumePirce(params) {
  return request.post(`${priceUrl}/volumes`, wrapperParams(params))
}
export function getAzurePrice(params) {
  return request.get('/ims/v1/azure/prices/flavors', { params: wrapperParams(params) })
}
export function getEipPirce(params) {
  return request.get(`${priceUrl}/eips`, {
    params: wrapperParams(params)
  })
}
