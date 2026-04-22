// 同步加载
export function getModules(files: any) {
  // 当files为方法时为webapock,为对象时为vite
  const isWebpack = typeof files === 'function'
  // 路径包含compoennts的是内置组件不向外暴露
  const modules = (isWebpack ? files.keys() : Object.keys(files)).filter((item: string) => !item.includes('components')).reduce((modules: any, modulePath: string) => {
    // set './app.vue' => 'app'
    const moduleName = modulePath.replace(/^\.\S*\/(.*)\.\w+$/, '$1')
    const value = isWebpack ? files(modulePath) : files[modulePath]
    modules[moduleName] = value.default
    return modules
  }, {});
  return modules;
}
// 异步加载
export function getAsyncModules(files: any, asyncImport: any) {
  // 当files为方法时为webapock,为对象时为vite
  const isWebpack = typeof files === 'function'
  const modules = (isWebpack ? files.keys() : Object.keys(files)).filter((item: string) => !item.includes('components')).reduce((modules: any, modulePath: string) => {
    // set './app.vue' => 'app'
    const moduleName = modulePath.replace(/^\.\S*\/(.*)\.\w+$/, '$1')
    modules[moduleName] = isWebpack ? asyncImport(modulePath) : files[moduleName]
    return modules
  }, {});
  return modules;
}
