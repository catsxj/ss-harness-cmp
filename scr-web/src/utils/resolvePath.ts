export function isExternalLink(path: string): boolean {
  return /^(http:|https:|mailto:|tel:)\/\//.test(path)
}

export function resolvePath(basePath: string, routePath: string): string {
  if (isExternalLink(routePath)) {
    return routePath
  }
  // 简单路径拼接，替代 Node.js 的 path.resolve
  if (routePath.startsWith('/')) {
    return routePath
  }
  return `${basePath.replace(/\/$/, '')}/${routePath}`
}
