import type { App, Directive } from 'vue'
import { usePermissionStore } from '@/stores/permission'

export const permission: Directive<HTMLElement, string> = {
  mounted(el, binding) {
    const store = usePermissionStore()
    if (!store.buttons.includes(binding.value)) {
      el.parentNode?.removeChild(el)
    }
  }
}

export function registerDirectives(app: App): void {
  app.directive('permission', permission)
}
