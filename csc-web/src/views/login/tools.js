import { setToken } from 'utils/auth'
import { enablePermissionStorage, menuKey, enableUserStorage, userKey } from '@/config'

export function setLoginData(data) {
  const { tenant = {}, accountCategory, user = {}, servicePermissions } = data
  if (enableUserStorage) {
    localStorage.setItem(userKey, JSON.stringify({ ...tenant, ...user, accountCategory }))
  }
  if (enablePermissionStorage) {
    localStorage.setItem(menuKey, JSON.stringify(servicePermissions || []))
  }
  localStorage.removeItem('lockData')
  setToken(data.token)
}
