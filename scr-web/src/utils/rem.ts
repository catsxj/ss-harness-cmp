function setRem(): void {
  const baseSize = 100
  const basePc = baseSize / 1920
  let vW = window.innerWidth
  const vH = window.innerHeight
  const dueH = (vW / 1920) * 1080
  if (vH < dueH) {
    vW = (vH / 1080) * 1920
  }
  const rem = vW * basePc
  document.documentElement.style.fontSize = rem + 'px'
}

setRem()
window.onresize = function () {
  setRem()
}
