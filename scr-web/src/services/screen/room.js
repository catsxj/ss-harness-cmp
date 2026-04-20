import request from 'utils/request'
import { wrapperParams } from 'utils'

export function getRooms () {
  return request.get('/ims/v1/rooms', {
    params: { page: 1, rows: 10000 }
  })
}

export function getRoomDetail (id) {
  return request.get(`/ims/v1/rooms/${id}`)
}

export function getRacks (roomId) {
  return request.get('/ims/v1/racks', {
    params: { page: 1, rows: 10000, params: JSON.stringify([{ param: { roomId }, sign: 'EQ' }]) }
  })
}

export function getOverview () {
  return request.get('/cos/v1/engine/room/base')
}

export function getCount (roomId = 0) {
  return request.get(`/cos/v1/engine/room/${roomId}/count`)
}

export function getEquipmentCount (roomId = 0) {
  return request.get(`/cos/v1/engine/room/${roomId}/equipments/switch`)
}

export function getAlarmCount (roomId = 0) {
  return request.get(`/cos/v1/engine/room/${roomId}/equipments/alert`)
}

export function getServerCount (roomId = 0, params = { type: 'cpu' }) {
  return request.get(`/cos/v1/engine/room/${roomId}/servers`, {
    params
  })
}
export function getDeviceList (roomId = 0) {
  return request.get(`/cos/v1/engine/room/${roomId}/equipments/temperature`)
}
export function getAlertList (roomId = 0) {
  return request.get(`/cos/v1/engine/room/${roomId}/alert`)
}
