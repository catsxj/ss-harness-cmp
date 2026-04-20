/**
 * Created by HaijunZhang on 2018/11/12.
 */
import { getProject } from 'services/system/project'

const state = {
  projectList: [],
  projectId: 0
}
const mutations = {
  SET_PROJECTID: (state, projectId) => {
    state.projectId = projectId
  },
  SET_PROJECTLIST: (state, list) => {
    state.projectList = list
  }
}
const actions = {
  GetProject({ commit, state: { sideRoutes }, rootGetters, rootState }) {
    return new Promise(resolve => {
      const id = rootGetters.userData.projectId
      getProject({
        condition: JSON.stringify({ condition: 'listProjects' })
      }).then(data => {
        if (data.success) {
          const projectList = data.data
          let projectId = 0
          // id exit and id is in list
          if (
            id &&
            projectList.some(item => {
              return item.id === id
            })
          ) {
            projectId = id
          }
          commit('SET_PROJECTLIST', projectList)
          commit('SET_PROJECTID', projectId)
          resolve()
        }
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
