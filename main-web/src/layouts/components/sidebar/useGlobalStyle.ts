import { onUnmounted, computed, unref } from 'vue'
import { useStore } from 'vuex'

export default function () {
  const store = useStore()
  const pageConfigs = computed(() => store.getters.pageConfig)
  const cssStyle: any = computed(() => {
    const { menuBgColour, subMenuBgColour, menuFontColour, menuFontSelectColour, menuSelectColour } = pageConfigs.value
    return {
      '--czhj-color-background': menuBgColour,
      '--czhj-color-background-sub': subMenuBgColour,
      '--czhj-color-text': menuFontColour,
      '--czhj-color-background-selected': menuSelectColour,
      '--czhj-color-text-selected': menuFontSelectColour
    }
  })
  const style = document.createElement('style')
  style.setAttribute('type', 'text/css')
  function generateCss() {
    let str = ''
    Object.keys(unref(cssStyle)).forEach((item: string) => {
      str += `${item}:${cssStyle.value[item]};`
    })
    return str
  }
  style.innerHTML = `:root{${generateCss()}}`
  document.head.appendChild(style)
  onUnmounted(() => {
    style && style.remove()
  })
  return {
    style: cssStyle
  }
}
