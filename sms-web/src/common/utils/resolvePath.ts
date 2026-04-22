import { startsWith } from 'lodash-es'

export function isExternalLink(path: string): boolean {
  return /^(http:|https:|mailto:|tel:)\/\//.test(path)
}

export function resolvePath(basePath: string, routePath: string): string {
  if (isExternalLink(routePath)) return routePath
  if (startsWith(routePath, '/')) return routePath
  const basePathArr = basePath.split('/')
  const routePathArr = routePath.split('/')
  const res = [...basePathArr, ...routePathArr].filter((item) => item)
  return `/${res.join('/')}`
}
