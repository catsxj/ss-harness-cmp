const getters = {
  sideRoutes: state => state.permission.sideRoutes,
  userData: state => state.app.userData,
  projectList: state => state.project.projectList,
  projectId: state => state.project.projectId,
  pageConfig: state => state.app.pageConfig,
  systemConfig: state => state.app.systemConfig,
  // 服务图标map
  serviceIcon: state => {
    const { favoriteList } = state.favorite
    const map = {}
    favoriteList.forEach(item => {
      const { code, icon } = item
      map[code] = icon
    })
    return map
  }
}
export default getters
