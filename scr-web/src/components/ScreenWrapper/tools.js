export function enableFullScreen() {
  const docElm = document.documentElement
  // W3C
  if (docElm.requestFullscreen) {
    docElm.requestFullscreen()
  } else if (docElm.mozRequestFullScreen) {
    // FireFox
    docElm.mozRequestFullScreen()
  } else if (docElm.webkitRequestFullScreen) {
    // Chrome等
    docElm.webkitRequestFullScreen()
  } else if (docElm.msRequestFullscreen) {
    // IE11
    document.body.msRequestFullscreen()
  }
}
export function disableFullScreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen()
  } else if (document.webkitCancelFullScreen) {
    document.webkitCancelFullScreen()
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen()
  }
}
