// Vue 3 TS port of original/cmp-element/components/full-screen/utils.js (unchanged logic)

interface FullscreenDocument extends Document {
  mozFullScreen?: boolean
  webkitIsFullScreen?: boolean
  mozFullScreenEnabled?: boolean
  msFullscreenEnabled?: boolean
  mozCancelFullScreen?: () => Promise<void>
  webkitExitFullscreen?: () => Promise<void>
  msExitFullscreen?: () => Promise<void>
  msFullscreenElement?: Element
}

interface FullscreenElement extends HTMLElement {
  mozRequestFullScreen?: () => Promise<void>
  webkitRequestFullscreen?: () => Promise<void>
  msRequestFullscreen?: () => Promise<void>
  webkitRequestFullScreen?: () => Promise<void>
}

export function supportFullScreen(): boolean {
  const doc = document.documentElement as FullscreenElement
  const fsDoc = document as FullscreenDocument
  return (
    'requestFullscreen' in doc ||
    ('mozRequestFullScreen' in doc && !!fsDoc.mozFullScreenEnabled) ||
    ('msRequestFullscreen' in doc && !!fsDoc.msFullscreenEnabled) ||
    'webkitRequestFullScreen' in doc
  )
}

export function fullScreenStatus(): boolean {
  const fsDoc = document as FullscreenDocument
  return !!(
    document.fullscreen ||
    fsDoc.mozFullScreen ||
    document.fullscreenElement ||
    fsDoc.msFullscreenElement ||
    fsDoc.webkitIsFullScreen
  )
}

export function requestFullscreen(element: FullscreenElement): void {
  if (element.requestFullscreen) {
    element.requestFullscreen()
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen()
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen()
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen()
  } else {
    console.warn('Fullscreen API is not supported.')
  }
}

export function exitFullscreen(): void {
  const fsDoc = document as FullscreenDocument
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (fsDoc.webkitExitFullscreen) {
    fsDoc.webkitExitFullscreen()
  } else if (fsDoc.mozCancelFullScreen) {
    fsDoc.mozCancelFullScreen()
  } else if (fsDoc.msExitFullscreen) {
    fsDoc.msExitFullscreen()
  } else {
    console.warn('Fullscreen API is not supported.')
  }
}

export function onFullScreenEvent(callback: () => void): void {
  document.addEventListener('fullscreenchange', callback)
  document.addEventListener('mozfullscreenchange', callback)
  document.addEventListener('MSFullscreenChange', callback)
  document.addEventListener('webkitfullscreenchange', callback)
}

export function offFullScreenEvent(callback: () => void): void {
  document.removeEventListener('fullscreenchange', callback)
  document.removeEventListener('mozfullscreenchange', callback)
  document.removeEventListener('MSFullscreenChange', callback)
  document.removeEventListener('webkitfullscreenchange', callback)
}
