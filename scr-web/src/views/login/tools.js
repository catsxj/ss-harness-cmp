import { setToken } from 'utils/auth'
import { enablePermissionStorage, menuKey, enableUserStorage, userKey } from '@/config'

export function setLoginData (data) {
  const { accountCategory, manager = {}, servicePermissions } = data
  if (enableUserStorage) {
    localStorage.setItem(userKey, JSON.stringify({ ...manager, accountCategory }))
  }
  if (enablePermissionStorage) {
    localStorage.setItem(menuKey, JSON.stringify(servicePermissions || []))
  }
  localStorage.setItem('buttonData', JSON.stringify(data.buttons || []))
  localStorage.removeItem('lockData')
  setToken(data.token)
}
