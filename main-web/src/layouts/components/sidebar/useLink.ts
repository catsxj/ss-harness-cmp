import { isExternalLink } from 'utils/resolvePath'
import { useRouter } from 'vue-router'
import type { Router } from 'vue-router'

export function openWindow(url: string, opt?: { target?: '_self' | '_blank' }) {
  const { target = '__blank' } = opt || {}
  window.open(url, target)
}
export function useLink(_router?: Router) {
  const { push } = _router || useRouter()
  function goPage(url: string) {
    if (isExternalLink(url)) {
      return openWindow(url)
    }
    push(url).catch((e) => {
      console.log(e)
    })
  }
  return goPage
}
