
// webpack
// const req = require.context('@/icons/svg', false, /\.svg$/)
// const requireAll = requireContext => requireContext.keys()

// const re = /\.\/(.*)\.svg/;

// const svgIcons = requireAll(req).map(i => {
//   return i.match(re)[1]
// })
// vite
// const req = import.meta.globEager('/src/icons/svg/*.svg')
// const re = /\/svg\/(.*)\.svg/
// const svgIcons = Object.keys(req).map(i => {
//   return i.match(re)[1]
// })

export default ['svg-about', 'svg-basic-resource', 'svg-bill', 'svg-business', 'svg-compute-resource', 'svg-db', 'svg-disabled', 'svg-dot', 'svg-middle', 'svg-network-resource', 'svg-operate', 'svg-ops-analysis', 'svg-order', 'svg-permission', 'svg-port', 'svg-product', 'svg-repository', 'svg-resource-interface', 'svg-resource-manage', 'svg-resource-monitor', 'svg-resource-ops', 'svg-screen', 'svg-security', 'svg-service-ops', 'svg-setting', 'svg-storage-resource', 'svg-task-platform']
