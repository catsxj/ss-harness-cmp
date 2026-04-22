const getters = {
  addRoutes: state => state.permission.addRoutes,
  userData: state => state.app.userData,
  appPath: state => state.app.appPath,
  pageConfig: state => state.app.pageConfig,
  systemConfig: state => state.app.systemConfig
}
export default getters
