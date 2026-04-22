import { createPinia } from 'pinia'

export { useAppStore } from './app'
export { usePermissionStore } from './permission'
export { useTagsViewStore } from './tagsView'

export default createPinia()
