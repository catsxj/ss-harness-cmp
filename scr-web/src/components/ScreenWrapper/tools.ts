export function enableFullScreen() {
  const docElm = document.documentElement as HTMLElement & {
    mozRequestFullScreen?: () => void
    webkitRequestFullScreen?: () => void
    msRequestFullscreen?: () => void
  }
  if (docElm.requestFullscreen) {
    docElm.requestFullscreen()
  } else if (docElm.mozRequestFullScreen) {
    docElm.mozRequestFullScreen()
  } else if (docElm.webkitRequestFullScreen) {
    docElm.webkitRequestFullScreen()
  } else if (docElm.msRequestFullscreen) {
    ;(document.body as HTMLElement & { msRequestFullscreen?: () => void }).msRequestFullscreen?.()
  }
}

export function disableFullScreen() {
  const doc = document as Document & {
    mozCancelFullScreen?: () => void
    webkitCancelFullScreen?: () => void
    msExitFullscreen?: () => void
  }
  if (doc.exitFullscreen) {
    doc.exitFullscreen()
  } else if (doc.mozCancelFullScreen) {
    doc.mozCancelFullScreen()
  } else if (doc.webkitCancelFullScreen) {
    doc.webkitCancelFullScreen()
  } else if (doc.msExitFullscreen) {
    doc.msExitFullscreen()
  }
}
