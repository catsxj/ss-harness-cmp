/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'

export function getDashboard(params) {
  return request.get('/cos/v1/soa/bills/overview', {
    params: wrapperParams(params)
  })
}
export function getAz(params) {
  return request.get('/cos/v1/soa/bills', {
    params: wrapperParams(params)
  })
}
export function getBillData(params) {
  return request.get('/cos/v1/soa/billsAnalysisNew', {
    params: wrapperParams(params)
  })
}

export function exportBill(params) {
  downloadFile('/cos/v1/soa/billsAnalysisNew/download', params)
}
