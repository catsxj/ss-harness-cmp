const getters = {
  addRoutes: (state) => state.permission.addRoutes,
  userData: (state) => state.app.userData,
  pageConfig: (state) => state.app.pageConfig,
  systemConfig: (state) => state.app.systemConfig
}
export default getters
