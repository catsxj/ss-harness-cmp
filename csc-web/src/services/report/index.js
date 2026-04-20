/* global $ */
import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getReport(params) {
  return request.get('/cos/v1/templates', {
    params: params
  })
}
export function getReportResource(params) {
  return request.get('/cos/v1/resources', {
    params: params
  })
}
export function getReportContent(params) {
  return request.get('/cos/v1/metrics', {
    params: wrapperParams(params)
  })
}
export function createReport(params) {
  return request.post('/cos/v1/templates', wrapperParams(params))
}
export function modifyReport(params) {
  return request.put(`/cos/v1/templates/${params.id}`, wrapperParams({ status: params.status }))
}
export function deleteReport(params) {
  return request.delete(`/cos/v1/templates/${params.id}`)
}
export function reportDetail(params) {
  return request.get(`/cos/v1/templates/${params.id}`)
}
export function reportDetailList(params) {
  return request.get('/cos/v1/reports', {
    params: params
  })
}
export function reportDetailRemove(params) {
  return request.delete(`/cos/v1/reports/${params.id}`)
}
export function downloadRemoportDetail(params) {
  request
    .get(`/cos/v1/reports/${params.id}`, {
      headers: { 'Content-Type': params.fileFormat },
      responseType: 'blob',
      params: wrapperParams(params),
      options: {
        isBlob: true
      }
    })
    .then(data => {
      const blob = data.data
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      const filename = data.headers['content-disposition'].split('inline; filename=')[1]
      reader.onload = function (e) {
        const a = document.createElement('a')
        a.download = filename
        a.href = e.target.result
        $('body').append(a)
        a.click()
        $(a).remove()
      }
    })
}
export function remoportDetailList(params) {
  return request.get(`/cos/v1/reports/${params.id}`)
}
