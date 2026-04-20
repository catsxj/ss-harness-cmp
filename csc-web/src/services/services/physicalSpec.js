import request from 'utils/request'
import { wrapperParams } from 'utils/index'
// 物理机 sku

// 品牌
const brandUrl = '/ims/v1/spec/brand'
export function getBrand(params) {
  return request.get(brandUrl, { params })
}
export function createBrand(params) {
  return request.post(brandUrl, wrapperParams(params))
}
export function modifyBrand(params) {
  return request.put(brandUrl, wrapperParams(params))
}
export function deleteBrand(id) {
  return request.delete(`${brandUrl}/${id}`)
}

// CPU 规格
const cpuUrl = '/ims/v1/spec/cpu'
export function getCpuSpecs(params) {
  return request.get(cpuUrl, { params })
}
export function createCpu(params) {
  return request.post(cpuUrl, wrapperParams(params))
}
export function modifyCpu(params) {
  return request.put(cpuUrl, wrapperParams(params))
}
export function deleteCpu(id) {
  return request.delete(`${cpuUrl}/${id}`)
}
// 启用/禁用
export function modifyCpuStatus(id, status) {
  return request.put(`${cpuUrl}/${id}?status=${status}`)
}

// 内存规格
const memoryUrl = '/ims/v1/spec/mem'
export function getMemorySpecs(params) {
  return request.get(memoryUrl, { params })
}
export function createMemory(params) {
  return request.post(memoryUrl, wrapperParams(params))
}
export function modifyMemory(params) {
  return request.put(memoryUrl, wrapperParams(params))
}
export function deleteMemory(id) {
  return request.delete(`${memoryUrl}/${id}`)
}
// 启用/禁用
export function modifyMemoryStatus(id, status) {
  return request.put(`${memoryUrl}/${id}?status=${status}`)
}

// 硬盘规格
const diskUrl = '/ims/v1/spec/disk'
export function getDiskSpecs(params) {
  return request.get(diskUrl, { params })
}
export function createDisk(params) {
  return request.post(diskUrl, wrapperParams(params))
}
export function modifyDisk(params) {
  return request.put(diskUrl, wrapperParams(params))
}
export function deleteDisk(id) {
  return request.delete(`${diskUrl}/${id}`)
}
// 启用/禁用
export function modifyDiskStatus(id, status) {
  return request.put(`${diskUrl}/${id}?status=${status}`)
}

// 配件规格
const partsUrl = '/ims/v1/spec/parts'
export function getParts(params) {
  return request.get(partsUrl, { params })
}
export function createParts(params) {
  return request.post(partsUrl, wrapperParams(params))
}
export function modifyParts(params) {
  return request.put(partsUrl, wrapperParams(params))
}
export function deleteParts(id) {
  return request.delete(`${partsUrl}/${id}`)
}
// 启用/禁用
export function modifyPartsStatus(id, status) {
  return request.put(`${partsUrl}/${id}?status=${status}`)
}

// 服务器规格
const serverUrl = '/ims/v1/spec/server'
export function getServer(params) {
  return request.get(serverUrl, { params })
}
export function createServer(params) {
  return request.post(serverUrl, wrapperParams(params))
}
export function modifyServer(params) {
  return request.put(serverUrl, wrapperParams(params))
}
export function deleteServer(id) {
  return request.delete(`${serverUrl}/${id}`)
}
// 启用/禁用
export function modifyServerStatus(id, status) {
  return request.put(`${serverUrl}/${id}?status=${status}`)
}
// 获取所有服务器规格型号
export function getServerModels(params) {
  return request.get(`${serverUrl}/model`, { params })
}
