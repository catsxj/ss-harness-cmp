import { ref, watch, computed, unref } from 'vue'
import { useRoute } from 'vue-router'
import { urlToList } from './utils'
import { useStore } from 'vuex'

export default function (props: { mainMenu: boolean }) {
  const route = useRoute()
  const store = useStore()
  function getDefaultOpenKeys(path: string) {
    return urlToList(path)
  }
  const { mainMenu } = props
  const collapsed = computed(() => store.state.app.isCollapsed)
  const openKeys = ref(getDefaultOpenKeys(route.path))
  if (mainMenu) {
    watch(
      () => route.path,
      () => {
        if (unref(collapsed)) return
        openKeys.value = getDefaultOpenKeys(route.path)
      }
    )
    watch(collapsed, () => {
      if (!collapsed.value) openKeys.value = getDefaultOpenKeys(route.path)
    })
  }
  // 处理菜单数据，只保持一个子菜单展开
  const handleOpenChange = (openKey: string[]) => {
    const result: string[] = []
    if (openKey.length) {
      const lastOpenKey = [...openKey].pop() as string
      openKey.forEach((item) => {
        // 子菜单打开父菜单也需要展开 || 父菜单展开之前缓存的子菜单数据也要展开
        if (lastOpenKey.includes(item) || item.includes(lastOpenKey)) {
          result.push(item)
        }
      })
    }
    openKeys.value = result
  }
  return {
    openKeys,
    handleOpenChange,
  }
}
