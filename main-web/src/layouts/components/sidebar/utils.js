/**
 * Created by HaijunZhang on 2019/7/5.
 */
// 获取菜单数组
export function getFlatMenuPath(menus) {
  const paths = []
  menus.forEach((item) => {
    paths.push(item.path)
    if (item.children) {
      paths.push(...getFlatMenuPath(item.children))
    }
  })
  return paths
}
// /userinfo/2144/id => ['/userinfo','/useinfo/2144,'/userindo/2144/id']
export function urlToList(url) {
  const urllist = url.split('/').filter((i) => i)
  return urllist.map((urlItem, index) => {
    return `/${urllist.slice(0, index + 1).join('/')}`
  })
}
export const getIcon = (icon, iconMap) => {
  if (iconMap) return iconMap[icon]
  if (typeof icon !== 'string') return icon
  // if (icon.indexOf('/') > -1) {
  //   return <img src={icon} alt="icon" className={'sider-menu-item-img'} />
  // }
  // if (icon.includes('iconfont')) {
  //   return <i className={icon} style={{ marginRight: '10px' }} />
  // }
}
