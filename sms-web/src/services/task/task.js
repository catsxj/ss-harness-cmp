/**
 * Created by HaijunZhang on 2019/7/23.
 */
import request from 'utils/request'
import { wrapperParams, downloadFile } from 'utils'

const baseUrl = '/cop/v1/tasks'

export function getTask(params) {
  return request.get(baseUrl, {
    params
  })
}
export function getTaskDetail(id) {
  return request.get(`${baseUrl}/${id}`)
}
export function createTask(params) {
  return request.post(baseUrl, wrapperParams(params))
}
export function modifyTask(params) {
  return request.put(`${baseUrl}/${params.id}`, wrapperParams(params))
}
export function removeTask(id) {
  return request.delete(`${baseUrl}/${id}`)
}
/*
 * action取值为：
 * start clone active suspend transfer applyStart applyRecover applyActive usage release recall
 */
// export function operateTask(id, action, params) {
//   return request.patch(`${baseUrl}/${id}`, {
//     action,
//     ...wrapperParams(params)
//   })
// }

const instanceUrl = '/cop/v1/tasks/instances'
export function getInstance(params) {
  return request.get(instanceUrl, {
    params
  })
}
export function removeInstance(id) {
  return request.delete(`${instanceUrl}/${id}`)
}
export function getInstanceDetail(id) {
  return request.get(`${instanceUrl}/${id}`)
}
export function getInstanceNode(id) {
  return request.get(`${instanceUrl}/nodes/${id}`)
}
export function checkInstanceFile(params) {
  return request.get(`${instanceUrl}/files/check`, { params })
}
export function exportInstanceFile(path) {
  downloadFile(`${instanceUrl}/files/download`, { path })
}
/*
 * action取值为：
 * start recover cancel suspend active result
 */
// export function operateInstance(id, action, params) {
//   return request.patch(`${instanceUrl}/${id}`, {
//     action,
//     ...wrapperParams(params)
//   })
// }
// action修改
export function operateInstance(id, action, params) {
  return request.patch(`${instanceUrl}/${id}/${action}`, wrapperParams(params))
}
export function exportInstance(id, params) {
  downloadFile(`${instanceUrl}/${id}/export`, params)
}

const sceneUrl = '/cop/v1/tasks/scenes'
export function getScene(params) {
  return request.get(sceneUrl, {
    params
  })
}
// simple修改
export function getSceneBySimple(params) {
  return request.get(`${sceneUrl}/simple`, {
    params
  })
}
export function getSceneDetail(id) {
  return request.get(`${sceneUrl}/${id}`)
}
export function createScene(params) {
  return request.post(sceneUrl, wrapperParams(params))
}
export function modifyScene(params) {
  return request.put(`${sceneUrl}/${params.id}`, wrapperParams(params))
}
export function removeScene(id) {
  return request.delete(`${sceneUrl}/${id}`)
}

const templateUrl = '/cop/v1/tasks/templates'
export function getTemplate(params) {
  return request.get(templateUrl, {
    params
  })
}
// simple修改
export function getTemplateBySimple(params) {
  return request.get(`${templateUrl}/simple`, {
    params
  })
}
export function getTemplateDetail(id) {
  return request.get(`${templateUrl}/${id}`)
}
export function createTemplate(params) {
  return request.post(templateUrl, wrapperParams(params))
}
export function modifyTemplate(params) {
  return request.put(`${templateUrl}/${params.id}`, wrapperParams(params))
}
