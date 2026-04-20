import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'

const billUrl = '/cos/v1/bills'

export function getBills(params) {
  return request.get(billUrl, {
    params
  })
}
export function createBills(params) {
  return request.post(billUrl, wrapperParams(params))
}
export function modifyBills(params) {
  return request.put(`${billUrl}/${params.id}`, wrapperParams(params))
}
export function removeBills(id) {
  return request.delete(`${billUrl}/${id}`)
}
export function getBillsDetail(id) {
  return request.get(`${billUrl}/${id}`)
}
export function conditionBill(params) {
  return request.get(`${billUrl}/condition`, { params })
}

export function getBillStats(params) {
  return request.get(`${billUrl}/stats`, {
    params: wrapperParams(params)
  })
}
export function getBillDashboard(params) {
  return request.get(`${billUrl}/dashboard`, {
    params: wrapperParams(params)
  })
}
export function operateBill(action, params) {
  return request.patch(`${billUrl}`, {
    action,
    ...params
  })
}

export function getCloudBills(params) {
  return request.get('/ims/v1/cloud/bills', {
    params
  })
}

const itemsUrl = '/cos/v1/bills/items'
export function getBillsItems(params) {
  return request.get(itemsUrl, {
    params
  })
}
export function createBillsItems(params) {
  return request.post(itemsUrl, wrapperParams(params))
}
export function getBillsItemsDetail(id) {
  return request.get(`${itemsUrl}/${id}`)
}
export function modifyBillsItems(params) {
  return request.put(`${itemsUrl}/${params.id}`, wrapperParams(params))
}
export function removeBillsItems(id) {
  return request.delete(`${itemsUrl}/${id}`)
}
const paymentsUrl = '/cos/v1/payments'
export function getPayments(params) {
  return request.get(paymentsUrl, {
    params
  })
}

export function getCloudBillsQuery(params) {
  return request.get('/ims/v1/cloud/bills/queryTypeList', { params: wrapperParams(params) })
}

export function syncCloudBills(params) {
  return request.post('/ims/v1/cloud/bills', params)
}
export function syncNewCloudBills(params) {
  return request.post('/ims/v1/cloud/bills/vendorType', params)
}

export function exportBill(params) {
  downloadFile('/cos/v1/bills/export', params)
}

export function getPublicCloudBillSelect(id) {
  return request.get(`/rms/v1/pc/bills/${id}/select`)
}

// 账单详情：分摊应用系统
export function getAllocated(params) {
  return request.get('/cos/v1/bill/project/allocated', { params: wrapperParams(params) })
}

/**
 * 分摊规则相关
 * */
// 预算列表
export function getQueryProjectBudget(id) {
  return request.get('/sms/v1/budget/queryProjectBudget')
}
// 新增分摊规则
export function addBudget(params) {
  return request.post('/cos/v1/allocationRule', params)
}
// 查询分摊规则
export function getSplitRule(params) {
  return request.get('/cos/v1/allocationRule', wrapperParams(params))
}
// 修改分摊规则
export function editSplitRule(id, params) {
  return request.put(`/cos/v1/allocationRule/${id}`, wrapperParams(params))
}
// 删除分摊规则
export function removeSplitRule(id) {
  return request.delete(`/cos/v1/allocationRule/${id}`)
}
// 设置分摊规则(单独、批量)
export function setSplitRule(params, id) {
  return request.post(`/cos/v1/bill/project/allocated/${id}`, params)
}
export function setSplitRules(params) {
  return request.post('/cos/v1/bill/project/allocated', params)
}
// 新增合同折扣:前端需要校验名称不能重复
export function addDiscount(params) {
  return request.post('/cos/v1/pool/discount', params)
}
// 资源池折扣设置
export function getDiscount() {
  return request.get('/cos/v1/pool/discount')
}

// 内部账单金额查询
export function getBillMoney(params) {
  return request.get('/cos/v1/bills/total/money', {
    params
  })
}
// 外部账单金额查询
export function getCloudMoney(params) {
  return request.get('/ims/v1/cloud/bills/total/money', {
    params
  })
}
/**
 * 账单账号相关
 **/
const accountUrl = '/cos/v1/vendor/account'
export function getAccount(params) {
  return request.get(accountUrl, { params })
}
export function postAccount(params) {
  return request.post(accountUrl, params)
}
export function putAccount(params, id) {
  return request.put(`${accountUrl}/${id}`, params)
}
export function deleteAccount(id) {
  return request.delete(`${accountUrl}/${id}`)
}
export function getVendors() {
  return request.get('/sms/v1/plugins/vendors')
}

export function getImportAccount(params) {
  return request.get('/cmp/v1/vendors', { params })
}

export function confirmImport(params) {
  return request.post(`${accountUrl}/import`, params)
}

export function getSelectVendors() {
  return request.get(`${accountUrl}/types`)
}
/**
 * 自定义账单相关1
 **/

const customBillUrl = '/cos/v1/bill/configuration'
export function getConfiguration(params) {
  return request.get(customBillUrl, { params })
}
export function postConfiguration(params) {
  return request.post(customBillUrl, params)
}
export function putConfiguration(params, id) {
  return request.put(`${customBillUrl}/${id}`, params)
}
export function deleteConfiguration(id) {
  return request.delete(`${customBillUrl}/${id}`)
}
export function patchConfiguration(action, id) {
  return request.patch(`${customBillUrl}/${id}`, action)
}

/**
 * 国联 自定义账单2
 **/

const customBillUrl2 = '/cos/v1/bills/custom'
export function getCustomBill(params) {
  return request.get(`${customBillUrl2}/list`, { params })
}

export function getCustomBillDetail(id) {
  return request.get(`${customBillUrl2}/info/${id}`)
}

export function deleteCustomBill(id) {
  return request.delete(`${customBillUrl2}/${id}`)
}
export function handleCustomBill(id) {
  return request.post(`${customBillUrl2}/handle/${id}`)
}
export function exportCustomBill(id) {
  downloadFile(`${customBillUrl2}/export/${id}`)
}
/**
 *账单查看相关
 **/

//  账单查看列表
export function getConfigurationResult(params) {
  return request.get('/cos/v1/bill/configuration/result', { params })
}
// 账单详情
export function getConfigurationResultDetail(params, id) {
  return request.get(`/cos/v1/bill/configuration/result/${id}`, { params })
}
// 导出账单
export function exportConfiguration(id) {
  downloadFile(`/cos/v1/bill/configuration/export/${id}`)
}
// 账单删除
export function deleteConfigurationResult(id) {
  return request.delete(`/cos/v1/bill/configuration/result/${id}`)
}
// 批量删除
export function deleteAllConfigurationResult(ids) {
  return request.delete('/cos/v1/bill/configuration/result/batch/delete', {
    data: wrapperParams(ids)
  })
}

/**
 * 费用总览相关
 **/
export function getCostOverview(params) {
  return request.get('cos/v1/bills/cost/overview', { params })
}
// 费用明细租户列表
export function getCostOverviewList(params) {
  return request.get('/cos/v1/bills/cost/overview/list', { params })
}
// 费用明细列表导出

export function exportviewList(params) {
  downloadFile('/cos/v1/bills/cost/overview/list/export', params)
}
// 资源类型费用分布
export function getCostOverviewListDetail(params) {
  return request.get('/cos/v1/bills/cost/overview/list/detail', { params })
}
