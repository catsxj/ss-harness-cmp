export const setBrowser = (icon: string, title: string): void => {
  const head = document.getElementsByTagName('head')[0]
  const linkTag = document.createElement('link')
  linkTag.href = icon
  linkTag.setAttribute('rel', 'shortcut icon')
  linkTag.setAttribute('type', 'image/x-icon')
  head.appendChild(linkTag)
  document.title = title
}

export const urlToList = (url: string): string[] => {
  const list = url.split('/').filter((i) => i)
  return list.map((_, index) => `/${list.slice(0, index + 1).join('/')}`)
}
