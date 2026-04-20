export const setBrowser = (icon, title) => {
  const head = document.getElementsByTagName('head')[0]
  const linkTag = document.createElement('link')
  linkTag.href = icon
  linkTag.setAttribute('rel', 'shortcut icon')
  linkTag.setAttribute('type', 'image/x-icon')
  head.appendChild(linkTag)
  document.title = title
}
// /system/configs/page -> [ '/system','/system/configs','/system/configs/page']
export const urlToList = (url) => {
  const urllist = url.split('/').filter((i) => i)
  return urllist.map((urlItem, index) => `/${urllist.slice(0, index + 1).join('/')}`)
}
