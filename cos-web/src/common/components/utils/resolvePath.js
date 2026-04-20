/**
 * Created by HaijunZhang on 2018/12/10.
 */
import path from 'path'
export function isExternalLink(path) {
  return /^(http:|https:|mailto:|tel:)\/\//.test(path)
}
export function resolvePath(basePath, routePath) {
  if (isExternalLink(routePath)) {
    return routePath
  }
  return path.resolve(basePath, routePath)
}
