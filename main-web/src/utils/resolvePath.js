/**
 * Created by HaijunZhang on 2018/12/10.
 */
// import path from 'path';
import { startsWith } from 'lodash-es'

export function isExternalLink(path) {
  return /^(http:|https:|mailto:|tel:)\/\//.test(path)
}
export function resolvePath(basePath, routePath) {
  if (isExternalLink(routePath)) {
    return routePath
  }
  // return path.resolve(basePath, routePath);
  const basePathArr = basePath.split('/')
  const routePathArr = routePath.split('/')
  if (startsWith(routePath, '/')) {
    return routePath
  }
  const res = [...basePathArr, ...routePathArr].filter((item) => item)
  return `/${res.join('/')}`
}
